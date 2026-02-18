import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchAnalytics = createAsyncThunk('analytics/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const [summary, perCategory, topReviewed, discountDist, categoryRating] = await Promise.all([
      api.get('/products/analytics/summary'),
      api.get('/products/analytics/products-per-category'),
      api.get('/products/analytics/top-reviewed'),
      api.get('/products/analytics/discount-distribution'),
      api.get('/products/analytics/category-avg-rating'),
    ]);
    return {
      summary: summary.data,
      perCategory: perCategory.data,
      topReviewed: topReviewed.data,
      discountDist: discountDist.data,
      categoryRating: categoryRating.data,
    };
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch analytics');
  }
});

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    summary: null,
    perCategory: [],
    topReviewed: [],
    discountDist: [],
    categoryRating: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, action.payload);
      })
      .addCase(fetchAnalytics.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export default analyticsSlice.reducer;
