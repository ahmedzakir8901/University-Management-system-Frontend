import React from 'react';
import { Box, Rating } from '@mui/material';

function StarRating({ value, readOnly = false, onChange, size = 'medium' }) {
  return (
    <Box>
      <Rating
        value={value}
        readOnly={readOnly}
        onChange={onChange}
        size={size}
        precision={1}
        max={5}
      />
    </Box>
  );
}

export default StarRating;