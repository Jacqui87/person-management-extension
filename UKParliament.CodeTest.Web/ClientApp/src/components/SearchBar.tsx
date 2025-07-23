// src/components/SearchBar.tsx
import React from "react";
import { TextField, Box } from "@mui/material";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  return (
    <Box sx={{ marginBottom: 2 }}>
      <TextField
        fullWidth
        label={placeholder || "Search"}
        variant="outlined"
        size="small"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Box>
  );
};

export default SearchBar;
