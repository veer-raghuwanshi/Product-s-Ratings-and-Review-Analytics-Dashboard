import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadFile, clearUpload } from '../store/slices/uploadSlice';
import { fetchAnalytics } from '../store/slices/analyticsSlice';
import {
  Box, Card, CardContent, Typography, Button, LinearProgress, Alert,
  List, ListItem, ListItemIcon, ListItemText, Paper, Chip
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

export default function UploadPage() {
  const dispatch = useDispatch();
  const { loading, result, error } = useSelector(s => s.upload);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFile = useCallback((file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      alert('Please upload an xlsx, xls, or csv file');
      return;
    }
    setSelectedFile(file);
    dispatch(clearUpload());
  }, [dispatch]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleUpload = () => {
    if (!selectedFile) return;
    dispatch(uploadFile(selectedFile)).then((action) => {
      if (action.meta.requestStatus === 'fulfilled') {
        dispatch(fetchAnalytics());
      }
    });
  };

  return (
    <Box maxWidth={700} mx="auto">
      <Typography variant="h5" fontWeight={700} mb={1}>Upload Product Data</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Import product ratings and review data from Excel (.xlsx, .xls) or CSV files.
      </Typography>

      {/* Format Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={1.5}>
            <InfoIcon color="info" />
            <Typography variant="subtitle2" fontWeight={600}>Required Columns</Typography>
          </Box>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {['product_id', 'product_name', 'category', 'discounted_price', 'actual_price',
              'discount_percentage', 'rating', 'rating_count', 'review_title', 'review_content'].map(col => (
              <Chip key={col} label={col} size="small" variant="outlined" />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Drop Zone */}
      <Paper
        elevation={0}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        sx={{
          border: `2px dashed ${dragOver ? '#1565C0' : '#BDBDBD'}`,
          borderRadius: 3,
          p: 5,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: dragOver ? '#E3F2FD' : 'white',
          transition: 'all 0.2s',
          mb: 2,
          '&:hover': { borderColor: '#1565C0', bgcolor: '#F5F9FF' }
        }}
        onClick={() => document.getElementById('file-input').click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".xlsx,.xls,.csv"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])}
        />
        <UploadFileIcon sx={{ fontSize: 56, color: dragOver ? '#1565C0' : '#BDBDBD', mb: 1 }} />
        <Typography variant="h6" color={dragOver ? 'primary' : 'text.secondary'} fontWeight={600}>
          Drop your file here or click to browse
        </Typography>
        <Typography variant="body2" color="text.disabled" mt={0.5}>
          Supports .xlsx, .xls, .csv files up to 50MB
        </Typography>
      </Paper>

      {/* Selected File */}
      {selectedFile && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <InsertDriveFileIcon color="primary" />
          <Box flex={1}>
            <Typography variant="body2" fontWeight={600}>{selectedFile.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </Typography>
          </Box>
          <Button variant="contained" onClick={handleUpload} disabled={loading}>
            {loading ? 'Uploading...' : 'Upload & Import'}
          </Button>
        </Paper>
      )}

      {loading && <LinearProgress sx={{ borderRadius: 2, mb: 2 }} />}

      {/* Result */}
      {result && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography fontWeight={600}>Import Successful!</Typography>
          <List dense disablePadding>
            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 32 }}><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary={`${result.inserted} products imported/updated`} />
            </ListItem>
            {result.skipped > 0 && (
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 32 }}><InfoIcon color="info" fontSize="small" /></ListItemIcon>
                <ListItemText primary={`${result.skipped} rows skipped (missing required fields)`} />
              </ListItem>
            )}
          </List>
        </Alert>
      )}

      {error && (
        <Alert severity="error" icon={<ErrorIcon />}>
          <Typography fontWeight={600}>Upload Failed</Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      )}
    </Box>
  );
}
