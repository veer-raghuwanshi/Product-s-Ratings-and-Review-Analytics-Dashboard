import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnalytics } from '../store/slices/analyticsSlice';
import {
  Grid, Card, CardContent, Typography, Box, Skeleton, Alert
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import StarIcon from '@mui/icons-material/Star';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import RateReviewIcon from '@mui/icons-material/RateReview';
import CategoryIcon from '@mui/icons-material/Category';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';

const COLORS = ['#1565C0','#1976D2','#1E88E5','#2196F3','#42A5F5','#64B5F6','#90CAF9','#BBDEFB','#FF6F00','#FF8F00','#FFA000','#FFB300','#FFC107'];

const StatCard = ({ icon, label, value, color, sub }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" gap={1.5}>
        <Box sx={{ bgcolor: `${color}18`, borderRadius: 2, p: 1.2, color }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>{label}</Typography>
          <Typography variant="h5" fontWeight={700} color={color}>{value ?? '—'}</Typography>
          {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const ChartCard = ({ title, children, height = 300 }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="subtitle1" fontWeight={700} mb={2}>{title}</Typography>
      <Box sx={{ width: '100%', height }}>{children}</Box>
    </CardContent>
  </Card>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: 'white', p: 1.5, border: '1px solid #e0e0e0', borderRadius: 2, boxShadow: 2 }}>
        <Typography variant="caption" fontWeight={600}>{label}</Typography>
        {payload.map((p, i) => (
          <Typography key={i} variant="body2" color={p.color}>{p.name}: <b>{p.value?.toLocaleString()}</b></Typography>
        ))}
      </Box>
    );
  }
  return null;
};

export default function Dashboard() {
  const dispatch = useDispatch();
  const { summary, perCategory, topReviewed, discountDist, categoryRating, loading, error } = useSelector(s => s.analytics);

  useEffect(() => { dispatch(fetchAnalytics()); }, [dispatch]);

  if (loading) return (
    <Grid container spacing={3}>
      {[...Array(8)].map((_, i) => (
        <Grid item xs={12} sm={6} md={3} key={i}><Skeleton variant="rounded" height={100} /></Grid>
      ))}
    </Grid>
  );

  if (error) return <Alert severity="error">{error}</Alert>;

  const fmt = (n) => n ? Number(n).toLocaleString() : '—';

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard icon={<InventoryIcon />} label="Total Products" value={fmt(summary?.total_products)} color="#1565C0" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard icon={<CategoryIcon />} label="Categories" value={fmt(summary?.total_categories)} color="#7B1FA2" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard icon={<StarIcon />} label="Avg Rating" value={summary?.avg_rating} color="#FF8F00" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard icon={<LocalOfferIcon />} label="Avg Discount" value={summary?.avg_discount ? `${summary.avg_discount}%` : '—'} color="#2E7D32" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard icon={<RateReviewIcon />} label="Total Reviews" value={fmt(summary?.total_reviews)} color="#C62828" />
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <ChartCard title="Products per Category" height={320}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perCategory} layout="vertical" margin={{ left: 10, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="main_category" width={130} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Products" radius={[0, 4, 4, 0]}>
                  {perCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  <LabelList dataKey="count" position="right" style={{ fontSize: 11, fill: '#555' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Top 10 Most Reviewed Products" height={320}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topReviewed} layout="vertical" margin={{ left: 10, right: 50 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <YAxis
                  type="category"
                  dataKey="product_name"
                  width={140}
                  tick={{ fontSize: 10 }}
                  tickFormatter={v => v.length > 22 ? v.substring(0, 22) + '…' : v}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="rating_count" name="Reviews" fill="#FF6F00" radius={[0, 4, 4, 0]}>
                  <LabelList dataKey="rating_count" position="right" style={{ fontSize: 10, fill: '#555' }} formatter={v => `${(v/1000).toFixed(1)}k`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <ChartCard title="Discount Distribution (Histogram)" height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={discountDist} margin={{ bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Products" radius={[4, 4, 0, 0]}>
                  {discountDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={7}>
          <ChartCard title="Category-wise Average Rating" height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryRating} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="main_category"
                  tick={{ fontSize: 10, angle: -35, textAnchor: 'end' }}
                  interval={0}
                />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avg_rating" name="Avg Rating" radius={[4, 4, 0, 0]}>
                  {categoryRating.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  <LabelList dataKey="avg_rating" position="top" style={{ fontSize: 10, fill: '#555' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
}
