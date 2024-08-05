// src/components/Header.js
import React from 'react';
import { AppBar, Toolbar, Typography } from '@material-ui/core';


const Header = () => {
  return (
    <AppBar position="static" className="headerStyles">
      <Toolbar>
        <img src="/logo.png" alt="Logo" className="logoStyle" />
        <Typography variant="h6"></Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
