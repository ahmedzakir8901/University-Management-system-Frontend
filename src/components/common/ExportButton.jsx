import React, { useState } from 'react';
import { Button, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { FileDownload, PictureAsPdf, TableChart } from '@mui/icons-material';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
import { toast } from 'react-hot-toast';

/**
 * Reusable Export button with PDF/Excel dropdown
 * 
 * @param {Object} props
 * @param {string} props.title - Title for the PDF
 * @param {Array<string>} props.columns - Column headers
 * @param {Array<Array>} props.rows - Row data
 * @param {string} props.fileName - Base filename (no extension)
 */
function ExportButton({ title, columns, rows, fileName }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleExportPDF = () => {
    if (!rows || rows.length === 0) {
      toast.error('No data to export');
      handleClose();
      return;
    }
    try {
      exportToPDF({ title, columns, rows, fileName });
      toast.success('PDF exported successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export PDF');
    }
    handleClose();
  };

  const handleExportExcel = () => {
    if (!rows || rows.length === 0) {
      toast.error('No data to export');
      handleClose();
      return;
    }
    try {
      exportToExcel({ columns, rows, fileName });
      toast.success('Excel exported successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export Excel');
    }
    handleClose();
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<FileDownload />}
        onClick={handleClick}
        size="medium"
      >
        Export
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleExportPDF}>
          <ListItemIcon>
            <PictureAsPdf fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Export as PDF</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportExcel}>
          <ListItemIcon>
            <TableChart fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText>Export as Excel</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

export default ExportButton;