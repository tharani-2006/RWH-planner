import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  AlertTitle,
  Divider,
  LinearProgress,
  Fab,
  Zoom,
  Slide,
  Grow,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Error,
  Refresh,
  Share,
  Download,
  ViewInAr,
  WaterDrop,
  AccountBalance,
  Engineering,
  Landscape,
  Timeline,
  TrendingUp,
  Eco,
  Speed,
  Star,
  PictureAsPdf,
  Description,
  ArrowDropDown
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import ARVisualization from './ARVisualization';
import { downloadPDF, generateDOC } from '../utils/pdfGenerator';

const ResultsDisplay = ({ results, formData, onReset }) => {
  const [arDialogOpen, setArDialogOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [downloadMenuAnchor, setDownloadMenuAnchor] = useState(null);

  useEffect(() => {
    if (results && results.feasibility === 'Feasible') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }

    // Animate cards in sequence
    const timer = setInterval(() => {
      setAnimationStep(prev => prev + 1);
    }, 200);

    setTimeout(() => clearInterval(timer), 2000);

    return () => clearInterval(timer);
  }, [results]);

  if (!results) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No results available
        </Typography>
      </Box>
    );
  }

  const getFeasibilityIcon = (feasibility) => {
    switch (feasibility) {
      case 'Feasible': return <CheckCircle color="success" />;
      case 'Limited Feasibility': return <Warning color="warning" />;
      default: return <Error color="error" />;
    }
  };

  const getFeasibilityClass = (feasibility) => {
    switch (feasibility) {
      case 'Feasible': return 'feasibility-feasible';
      case 'Limited Feasibility': return 'feasibility-limited';
      default: return 'feasibility-not-recommended';
    }
  };

  const getStructureIcon = (structure) => {
    switch (structure) {
      case 'pit': return '⬜';
      case 'trench': return '📏';
      case 'shaft': return '🔹';
      default: return '🏗️';
    }
  };

  const getPaybackColor = (years) => {
    if (years <= 5) return '#4caf50';
    if (years <= 10) return '#8bc34a';
    if (years <= 15) return '#ff9800';
    return '#f44336';
  };

  const handleARView = () => {
    setArDialogOpen(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Rainwater Harvesting Plan',
        text: `Check out my personalized rainwater harvesting plan for ${formData.locationName}!`,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleDownloadPDF = () => {
    try {
      downloadPDF(results, formData);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handleDownloadDOC = () => {
    try {
      generateDOC(results, formData);
    } catch (error) {
      console.error('Error generating DOC:', error);
      alert('Error generating DOC. Please try again.');
    }
  };

  return (
    <Box className="step-content">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography variant="h4" gutterBottom align="center" color="primary" sx={{ mb: 1 }}>
          🎯 Your Personalized RWH Plan
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 3 }}>
          AI-Powered Recommendations for {formData.locationName}
        </Typography>
      </motion.div>

      {/* Feasibility Status with Animation */}
      <Grow in={animationStep >= 0} timeout={800}>
        <Card
          elevation={6}
          sx={{
            mb: 3,
            border: '3px solid',
            borderColor: results.feasibility === 'Feasible' ? '#4caf50' : '#ff9800',
            background: results.feasibility === 'Feasible'
              ? 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)'
              : 'linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%)',
            position: 'relative',
            overflow: 'visible'
          }}
        >
          <CardContent>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                {getFeasibilityIcon(results.feasibility)}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Project Status
                </Typography>
                {results.feasibility === 'Feasible' && (
                  <Badge badgeContent="✨" sx={{ ml: 2 }}>
                    <Star color="primary" />
                  </Badge>
                )}
              </Box>
            </motion.div>
            <Box sx={{ textAlign: 'center' }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <Chip
                  label={results.feasibility}
                  className={`feasibility-badge ${getFeasibilityClass(results.feasibility)}`}
                  size="large"
                  sx={{ fontSize: '1.1rem', py: 3, px: 2 }}
                />
              </motion.div>
            </Box>
          </CardContent>

          {/* Floating AR Button */}
          <Zoom in={animationStep >= 1} timeout={1000}>
            <Fab
              color="secondary"
              sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #ff5252, #26c6da)',
                  transform: 'scale(1.1)'
                }
              }}
              onClick={() => setArDialogOpen(true)}
            >
              <ViewInAr />
            </Fab>
          </Zoom>
        </Card>
      </Grow>

      <Grid container spacing={3}>
        {/* Structure Recommendation */}
        <Grid item xs={12} md={6}>
          <Slide direction="right" in={animationStep >= 2} timeout={800}>
            <Card
              className="results-card"
              elevation={4}
              sx={{
                background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                border: '2px solid #1976d2',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(25, 118, 210, 0.2)'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Engineering color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Recommended Structure</Typography>
                  <Chip label="AI Selected" size="small" color="primary" sx={{ ml: 'auto' }} />
                </Box>

                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 1, type: "spring", stiffness: 200 }}
                >
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="h1" className="structure-icon" sx={{ fontSize: '4rem' }}>
                      {getStructureIcon(results.recommended_structure)}
                    </Typography>
                    <Typography variant="h5" color="primary" sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
                      {results.recommended_structure.replace('_', ' ')}
                    </Typography>
                  </Box>
                </motion.div>

                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Space Optimized:</strong> Perfect fit for your {formData.spaceLength}m × {formData.spaceWidth}m area
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Slide>
        </Grid>

        {/* Dimensions */}
        <Grid item xs={12} md={6}>
          <Slide direction="left" in={animationStep >= 3} timeout={800}>
            <Card
              className="results-card"
              elevation={4}
              sx={{
                background: 'linear-gradient(135deg, #f3e5f5 0%, #e8f5e8 100%)',
                border: '2px solid #2e7d32',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(46, 125, 50, 0.2)'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Landscape color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Structure Dimensions</Typography>
                  <Tooltip title="Precision Engineered">
                    <Engineering color="secondary" sx={{ ml: 'auto' }} />
                  </Tooltip>
                </Box>

                <Grid container spacing={2}>
                  {[
                    { value: results.dimensions.length, label: 'Length (m)', color: '#1976d2', delay: 0.2 },
                    { value: results.dimensions.width, label: 'Width (m)', color: '#2e7d32', delay: 0.4 },
                    { value: results.dimensions.depth, label: 'Depth (m)', color: '#ed6c02', delay: 0.6 }
                  ].map((dimension, index) => (
                    <Grid item xs={4} key={index}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5 + dimension.delay, duration: 0.5 }}
                      >
                        <Box
                          className="metric-card"
                          sx={{
                            background: 'white',
                            border: `2px solid ${dimension.color}`,
                            borderRadius: 3,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.05)',
                              boxShadow: `0 8px 16px ${dimension.color}30`
                            }
                          }}
                        >
                          <Typography
                            className="metric-value"
                            sx={{ color: dimension.color, fontSize: '2.5rem' }}
                          >
                            {dimension.value}
                          </Typography>
                          <Typography className="metric-label">
                            {dimension.label}
                          </Typography>
                        </Box>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2.5, duration: 0.5 }}
                >
                  <Alert
                    severity="success"
                    sx={{
                      mt: 2,
                      background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
                      border: '1px solid #4caf50'
                    }}
                    icon={<WaterDrop />}
                  >
                    <Typography variant="body2">
                      <strong>Storage Capacity:</strong> {results.dimensions.volume.toLocaleString()} liters
                      <br />
                      <strong>Daily Supply:</strong> ~{Math.round(results.dimensions.volume / 365)} liters/day
                    </Typography>
                  </Alert>
                </motion.div>
              </CardContent>
            </Card>
          </Slide>
        </Grid>

        {/* Cost Analysis */}
        <Grid item xs={12} md={6}>
          <Card className="results-card" elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalance color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Cost Analysis</Typography>
              </Box>
              
              <Box className="cost-breakdown">
                <Typography variant="h4" color="primary" align="center" sx={{ mb: 1 }}>
                  ₹{results.cost_estimation.total_cost.toLocaleString()}
                </Typography>
                <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 2 }}>
                  Total Construction Cost
                </Typography>
                
                <Box className="payback-indicator">
                  <Typography variant="body2">
                    <strong>Cost per Liter:</strong> ₹{results.cost_estimation.cost_per_liter}
                  </Typography>
                  <Chip 
                    label={`${results.cost_estimation.payback_period_years} years payback`}
                    sx={{ 
                      backgroundColor: getPaybackColor(results.cost_estimation.payback_period_years),
                      color: 'white'
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Water Harvesting Potential */}
        <Grid item xs={12} md={6}>
          <Card className="results-card" elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WaterDrop color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Water Harvesting</Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Annual Harvestable Water
                </Typography>
                <Typography variant="h4" color="secondary">
                  {results.water_harvesting.annual_harvestable.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  liters per year
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Storage Efficiency
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(100, results.water_harvesting.storage_efficiency)}
                  sx={{ height: 8, borderRadius: 4, mb: 1 }}
                />
                <Typography variant="body2" align="center">
                  {results.water_harvesting.storage_efficiency.toFixed(1)}%
                </Typography>
              </Box>
              
              <Alert severity="success">
                <Typography variant="body2">
                  <strong>Annual Savings:</strong> ₹{results.water_harvesting.annual_savings.toLocaleString()}
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Location Analysis */}
        <Grid item xs={12}>
          <Card className="results-card" elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Timeline color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Location Analysis - {formData.locationName}</Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Groundwater Depth
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {results.location_info.groundwater_depth}m below surface
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Dominant Soil Type
                  </Typography>
                  <Typography variant="h6" color="secondary">
                    {results.location_info.dominant_soil_type}
                  </Typography>
                </Grid>
              </Grid>
              
              {results.location_info.soil_composition && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Soil Composition
                  </Typography>
                  <Box className="soil-composition">
                    <Box 
                      className="soil-bar soil-sandy" 
                      sx={{ width: `${results.location_info.soil_composition.sandy}%` }}
                    >
                      {results.location_info.soil_composition.sandy > 10 && `${results.location_info.soil_composition.sandy}% Sandy`}
                    </Box>
                    <Box 
                      className="soil-bar soil-loamy" 
                      sx={{ width: `${results.location_info.soil_composition.loamy}%` }}
                    >
                      {results.location_info.soil_composition.loamy > 10 && `${results.location_info.soil_composition.loamy}% Loamy`}
                    </Box>
                    <Box 
                      className="soil-bar soil-clayey" 
                      sx={{ width: `${results.location_info.soil_composition.clayey}%` }}
                    >
                      {results.location_info.soil_composition.clayey > 10 && `${results.location_info.soil_composition.clayey}% Clayey`}
                    </Box>
                    <Box 
                      className="soil-bar soil-rocky" 
                      sx={{ width: `${results.location_info.soil_composition.rocky}%` }}
                    >
                      {results.location_info.soil_composition.rocky > 10 && `${results.location_info.soil_composition.rocky}% Rocky`}
                    </Box>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3, duration: 0.6 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4, flexWrap: 'wrap' }}>
          <Tooltip title="Experience your structure in 3D and AR">
            <Button
              variant="contained"
              onClick={() => setArDialogOpen(true)}
              startIcon={<ViewInAr />}
              size="large"
              sx={{
                background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                color: 'white',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '1.1rem',
                boxShadow: '0 8px 16px rgba(255, 107, 107, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #ff5252, #26c6da)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 24px rgba(255, 107, 107, 0.4)'
                }
              }}
            >
              View in AR
            </Button>
          </Tooltip>

          <Button
            variant="outlined"
            onClick={handleShare}
            startIcon={<Share />}
            size="large"
            sx={{ borderRadius: 3, px: 3 }}
          >
            Share Plan
          </Button>

          <Button
            variant="outlined"
            onClick={(e) => setDownloadMenuAnchor(e.currentTarget)}
            startIcon={<Download />}
            endIcon={<ArrowDropDown />}
            size="large"
            sx={{ borderRadius: 3, px: 3 }}
          >
            Download Report
          </Button>

          <Menu
            anchorEl={downloadMenuAnchor}
            open={Boolean(downloadMenuAnchor)}
            onClose={() => setDownloadMenuAnchor(null)}
            PaperProps={{
              sx: { mt: 1, minWidth: 200 }
            }}
          >
            <MenuItem onClick={() => { handleDownloadPDF(); setDownloadMenuAnchor(null); }}>
              <ListItemIcon>
                <PictureAsPdf color="error" />
              </ListItemIcon>
              <ListItemText
                primary="Download PDF"
                secondary="Complete detailed report"
              />
            </MenuItem>
            <MenuItem onClick={() => { handleDownloadDOC(); setDownloadMenuAnchor(null); }}>
              <ListItemIcon>
                <Description color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Download DOC"
                secondary="Editable Word document"
              />
            </MenuItem>
          </Menu>

          <Button
            variant="text"
            onClick={onReset}
            startIcon={<Refresh />}
            size="large"
            sx={{ borderRadius: 3, px: 3 }}
          >
            Start Over
          </Button>
        </Box>
      </motion.div>

      {/* AR Visualization Dialog */}
      <ARVisualization
        open={arDialogOpen}
        onClose={() => setArDialogOpen(false)}
        results={results}
        formData={formData}
      />


    </Box>
  );
};

export default ResultsDisplay;
