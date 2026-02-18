import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories, setFilters, setPage, setLimit } from '../store/slices/productsSlice';
import {
  Box, Card, CardContent, TextField, Select, MenuItem, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Chip, Typography, InputAdornment, CircularProgress, Alert, Rating, Grid, IconButton, Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

const RatingCell = ({ value }) => {
  if (!value) return <Typography variant="body2" color="text.disabled">—</Typography>;
  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      <Rating value={Number(value)} precision={0.1} size="small" readOnly />
      <Typography variant="caption" color="text.secondary">({value})</Typography>
    </Box>
  );
};

const PriceCell = ({ discounted, actual, discount }) => (
  <Box>
    <Typography variant="body2" fontWeight={600}>₹{discounted?.toLocaleString() || '—'}</Typography>
    {actual && <Typography variant="caption" color="text.disabled" sx={{ textDecoration: 'line-through' }}>₹{actual.toLocaleString()}</Typography>}
    {discount && <Chip label={`${Math.round(discount * 100)}% off`} size="small" color="success" sx={{ ml: 0.5, height: 18, fontSize: 10 }} />}
  </Box>
);

const CategoryChip = ({ category }) => {
  if (!category) return '—';
  const main = category.split('|')[0];
  return <Chip label={main} size="small" variant="outlined" color="primary" />;
};

export default function ProductsTable() {
  const dispatch = useDispatch();
  const { data, pagination, categories, filters, loading, error } = useSelector(s => s.products);

  const loadProducts = useCallback(() => {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...(filters.search && { search: filters.search }),
      ...(filters.category && { category: filters.category }),
      ...(filters.minRating && { minRating: filters.minRating }),
      ...(filters.maxRating && { maxRating: filters.maxRating }),
    };
    dispatch(fetchProducts(params));
  }, [
    dispatch,
    pagination.page,
    pagination.limit,
    filters.search,
    filters.category,
    filters.minRating,
    filters.maxRating,
  ]);

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);
  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
    dispatch(setPage(1));
  };

  const clearFilters = () => {
    dispatch(setFilters({ search: '', category: '', minRating: '', maxRating: '' }));
    dispatch(setPage(1));
  };

  const hasFilters = filters.search || filters.category || filters.minRating || filters.maxRating;

  return (
    <Box>
      {/* Filters */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <FilterListIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>Filters & Search</Typography>
            {hasFilters && (
              <Tooltip title="Clear all filters">
                <IconButton size="small" onClick={clearFilters}><ClearIcon fontSize="small" /></IconButton>
              </Tooltip>
            )}
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Search Product Name"
                value={filters.search}
                onChange={e => handleFilterChange('search', e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select value={filters.category} label="Category" onChange={e => handleFilterChange('category', e.target.value)}>
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Min Rating</InputLabel>
                <Select value={filters.minRating} label="Min Rating" onChange={e => handleFilterChange('minRating', e.target.value)}>
                  <MenuItem value="">Any</MenuItem>
                  {[1,2,3,4,4.5].map(v => <MenuItem key={v} value={v}>{v}+</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Max Rating</InputLabel>
                <Select value={filters.maxRating} label="Max Rating" onChange={e => handleFilterChange('maxRating', e.target.value)}>
                  <MenuItem value="">Any</MenuItem>
                  {[2,3,4,5].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: '#F5F7FA', py: 1.5 } }}>
                <TableCell>#</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Reviews</TableCell>
                <TableCell>Review Title</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={36} />
                    <Typography variant="body2" color="text.secondary" mt={1}>Loading...</Typography>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No products found. Upload data to get started.</Typography>
                  </TableCell>
                </TableRow>
              ) : data.map((row, i) => (
                <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: '#F5F7FA' } }}>
                  <TableCell>
                    <Typography variant="caption" color="text.disabled">
                      {(pagination.page - 1) * pagination.limit + i + 1}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 280 }}>
                    <Tooltip title={row.product_name}>
                      <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280, fontWeight: 500 }}>
                        {row.product_name}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell><CategoryChip category={row.category} /></TableCell>
                  <TableCell>
                    <PriceCell discounted={row.discounted_price} actual={row.actual_price} discount={row.discount_percentage} />
                  </TableCell>
                  <TableCell><RatingCell value={row.rating} /></TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.rating_count?.toLocaleString() || '—'}</Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>
                    <Tooltip title={row.review_title || ''}>
                      <Typography variant="caption" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', maxWidth: 200 }}>
                        {row.review_title || '—'}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.page - 1}
          rowsPerPage={pagination.limit}
          rowsPerPageOptions={[10, 25, 50, 100]}
          onPageChange={(_, p) => dispatch(setPage(p + 1))}
          onRowsPerPageChange={(e) => {
            const nextLimit = Number(e.target.value);
            dispatch(setPage(1));
            dispatch(setLimit(nextLimit));
          }}
        />
      </Card>
    </Box>
  );
}
