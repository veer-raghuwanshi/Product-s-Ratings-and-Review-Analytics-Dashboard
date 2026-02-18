import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const uploadFile = createAsyncThunk('upload/uploadFile', async (file, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/products/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Upload failed');
  }
});

const uploadSlice = createSlice({
  name: 'upload',
  initialState: { loading: false, result: null, error: null },
  reducers: {
    clearUpload(state) { state.result = null; state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadFile.pending, (state) => { state.loading = true; state.result = null; state.error = null; })
      .addCase(uploadFile.fulfilled, (state, action) => { state.loading = false; state.result = action.payload; })
      .addCase(uploadFile.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearUpload } = uploadSlice.actions;
export default uploadSlice.reducer;
