import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  AlertTitle,
  Tabs,
  Tab,
  Card,
  CardContent,
  IconButton,
  Fab,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  ViewInAr,
  CameraAlt,
  Download,
  Share,
  Close,
  Fullscreen,
  FullscreenExit,
  Refresh,
  Info,
  ThreeDRotation
} from '@mui/icons-material';
// Temporarily simplified without Three.js to avoid dependency conflicts
// import { Canvas } from '@react-three/fiber';
// import { OrbitControls, Text, Box as ThreeBox, Cylinder, Plane } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

const ARVisualization = ({ open, onClose, results, formData }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [arSupported, setArSupported] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    checkARSupport();
  }, []);

  const checkARSupport = async () => {
    // Check if WebXR is supported
    if ('xr' in navigator) {
      try {
        const supported = await navigator.xr.isSessionSupported('immersive-ar');
        setArSupported(supported);
      } catch (error) {
        console.log('WebXR not supported');
        setArSupported(false);
      }
    } else {
      setArSupported(false);
    }
  };

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      return stream;
    } catch (error) {
      setCameraPermission(false);
      console.error('Camera permission denied:', error);
      return null;
    }
  };

  const startARSession = async () => {
    setLoading(true);
    try {
      const stream = await requestCameraPermission();
      if (stream) {
        // Simulate AR initialization
        setTimeout(() => {
          setLoading(false);
          setActiveTab(1); // Switch to AR view
        }, 2000);
      }
    } catch (error) {
      setLoading(false);
      console.error('AR session failed:', error);
    }
  };

  // Advanced CSS-based 3D House Model with AR Features
  const Advanced3DHouseModel = ({ roofDimensions, goal, onRotate, onZoom }) => {
    const [rotation, setRotation] = useState({ x: 45, y: 0, z: 0 });
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
      setIsDragging(true);
      setLastMouse({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - lastMouse.x;
      const deltaY = e.clientY - lastMouse.y;

      setRotation(prev => ({
        ...prev,
        y: prev.y + deltaX * 0.5,
        x: Math.max(-90, Math.min(90, prev.x - deltaY * 0.5))
      }));

      setLastMouse({ x: e.clientX, y: e.clientY });
      onRotate && onRotate(rotation);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleWheel = (e) => {
      e.preventDefault();
      const newZoom = Math.max(0.5, Math.min(3, zoom + (e.deltaY > 0 ? -0.1 : 0.1)));
      setZoom(newZoom);
      onZoom && onZoom(newZoom);
    };

    const houseStyle = {
      width: '300px',
      height: '200px',
      position: 'relative',
      margin: '50px auto',
      transformStyle: 'preserve-3d',
      transform: `
        perspective(800px)
        rotateX(${rotation.x}deg)
        rotateY(${rotation.y}deg)
        rotateZ(${rotation.z}deg)
        scale(${zoom})
      `,
      transition: isDragging ? 'none' : 'transform 0.3s ease',
      cursor: isDragging ? 'grabbing' : 'grab'
    };

    return (
      <Box
        sx={{
          height: '500px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)',
          borderRadius: 2,
          position: 'relative'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Control Instructions */}
        <Box sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          p: 1,
          borderRadius: 1,
          fontSize: '0.8rem',
          zIndex: 10
        }}>
          🖱️ Drag to rotate • 🔍 Scroll to zoom
        </Box>

        {/* Roof Dimensions Display */}
        <Box sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'rgba(25, 118, 210, 0.9)',
          color: 'white',
          p: 1,
          borderRadius: 1,
          zIndex: 10
        }}>
          <Typography variant="body2">
            📐 Roof: {roofDimensions?.roofArea || 150}m²
            ({Math.sqrt(roofDimensions?.roofArea || 150).toFixed(1)}m × {Math.sqrt(roofDimensions?.roofArea || 150).toFixed(1)}m)
          </Typography>
        </Box>

        {/* 3D House Structure */}
        <div style={houseStyle}>
          {/* House Base */}
          <div style={{
            width: '200px',
            height: '120px',
            background: 'linear-gradient(45deg, #DEB887, #D2B48C)',
            position: 'absolute',
            left: '50px',
            top: '40px',
            border: '2px solid #8B7355',
            borderRadius: '8px',
            transform: 'translateZ(0px)',
            boxShadow: '0 0 20px rgba(0,0,0,0.3)'
          }}>
            {/* Door */}
            <div style={{
              width: '25px',
              height: '50px',
              background: '#8B4513',
              position: 'absolute',
              left: '87px',
              bottom: '0px',
              border: '1px solid #654321',
              borderRadius: '4px 4px 0 0'
            }} />

            {/* Windows */}
            <div style={{
              width: '20px',
              height: '20px',
              background: '#87CEEB',
              position: 'absolute',
              left: '30px',
              top: '30px',
              border: '2px solid #4682B4',
              borderRadius: '2px'
            }} />
            <div style={{
              width: '20px',
              height: '20px',
              background: '#87CEEB',
              position: 'absolute',
              right: '30px',
              top: '30px',
              border: '2px solid #4682B4',
              borderRadius: '2px'
            }} />
          </div>

          {/* Roof */}
          <div style={{
            width: '220px',
            height: '140px',
            background: 'linear-gradient(45deg, #8B4513, #A0522D)',
            position: 'absolute',
            left: '40px',
            top: '20px',
            border: '2px solid #654321',
            borderRadius: '12px',
            transform: 'translateZ(10px)',
            boxShadow: '0 0 15px rgba(0,0,0,0.2)'
          }}>
            {/* Roof Ridge */}
            <div style={{
              width: '200px',
              height: '8px',
              background: '#654321',
              position: 'absolute',
              left: '10px',
              top: '66px',
              borderRadius: '4px'
            }} />
          </div>

          {/* Goal-based Structures */}
          {goal === 'storage' && (
            <>
              {/* Rooftop Water Tank */}
              <div style={{
                width: '60px',
                height: '80px',
                background: 'linear-gradient(135deg, #4169E1, #1E90FF)',
                position: 'absolute',
                left: '170px',
                top: '-20px',
                borderRadius: '30px',
                border: '3px solid #0000CD',
                transform: 'translateZ(20px)',
                boxShadow: '0 0 20px rgba(65, 105, 225, 0.5)',
                opacity: 0.9
              }}>
                {/* Tank Label */}
                <div style={{
                  position: 'absolute',
                  top: '-25px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.8)',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  whiteSpace: 'nowrap'
                }}>
                  💧 Storage Tank
                </div>
              </div>

              {/* Tank Stand */}
              <div style={{
                width: '80px',
                height: '20px',
                background: '#696969',
                position: 'absolute',
                left: '160px',
                top: '40px',
                borderRadius: '4px',
                transform: 'translateZ(15px)'
              }} />

              {/* Connecting Pipes */}
              <div style={{
                width: '4px',
                height: '60px',
                background: '#808080',
                position: 'absolute',
                left: '198px',
                top: '60px',
                borderRadius: '2px',
                transform: 'translateZ(12px)'
              }} />
            </>
          )}

          {goal === 'recharge' && (
            <>
              {/* Underground Recharge Pit */}
              <div style={{
                width: '80px',
                height: '60px',
                background: 'linear-gradient(135deg, #8B4513, #A0522D)',
                position: 'absolute',
                left: '280px',
                top: '100px',
                borderRadius: '8px',
                border: '3px solid #654321',
                transform: 'translateZ(-10px)',
                opacity: 0.8,
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)'
              }}>
                {/* Pit Label */}
                <div style={{
                  position: 'absolute',
                  top: '-25px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0,100,0,0.9)',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  whiteSpace: 'nowrap'
                }}>
                  🌱 Recharge Pit
                </div>

                {/* Filter Layers */}
                <div style={{
                  width: '70px',
                  height: '8px',
                  background: '#DAA520',
                  position: 'absolute',
                  left: '5px',
                  top: '10px',
                  borderRadius: '2px'
                }} />
                <div style={{
                  width: '70px',
                  height: '8px',
                  background: '#CD853F',
                  position: 'absolute',
                  left: '5px',
                  top: '25px',
                  borderRadius: '2px'
                }} />
              </div>

              {/* Inlet Pipe */}
              <div style={{
                width: '6px',
                height: '40px',
                background: '#808080',
                position: 'absolute',
                left: '318px',
                top: '80px',
                borderRadius: '3px',
                transform: 'translateZ(5px) rotateZ(15deg)',
                transformOrigin: 'bottom'
              }} />

              {/* Pit Cover */}
              <div style={{
                width: '85px',
                height: '65px',
                background: 'rgba(105, 105, 105, 0.7)',
                position: 'absolute',
                left: '277px',
                top: '97px',
                borderRadius: '8px',
                border: '2px solid #696969',
                transform: 'translateZ(2px)'
              }} />
            </>
          )}
        </div>

        {/* Additional Structures Suggestions */}
        <Box sx={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          right: 10,
          background: 'rgba(255,255,255,0.9)',
          p: 2,
          borderRadius: 2,
          maxHeight: '100px',
          overflow: 'auto'
        }}>
          <Typography variant="subtitle2" gutterBottom>
            💡 Suggested Additional Structures:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {goal === 'storage' ? (
              <>
                <Chip label="🔧 First Flush Diverter" size="small" color="primary" />
                <Chip label="🧽 Sand Filter" size="small" color="secondary" />
                <Chip label="⚡ Pump System" size="small" color="success" />
              </>
            ) : (
              <>
                <Chip label="🌊 Percolation Tank" size="small" color="primary" />
                <Chip label="🏗️ Check Dam" size="small" color="secondary" />
                <Chip label="🌿 Bio-swale" size="small" color="success" />
              </>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const shareAR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Rainwater Harvesting Structure',
          text: `Check out my ${results.recommended_structure} design for ${formData.locationName}!`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    }
  };

  if (!results) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      fullScreen={isFullscreen}
      PaperProps={{
        sx: { 
          minHeight: '80vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ViewInAr sx={{ mr: 1 }} />
          <Typography variant="h6">
            AR Visualization - {results.recommended_structure.replace('_', ' ').toUpperCase()}
          </Typography>
        </Box>
        <Box>
          <IconButton color="inherit" onClick={toggleFullscreen}>
            {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
          <IconButton color="inherit" onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}
        >
          <Tab label="3D Preview" icon={<ThreeDRotation />} />
          <Tab label="AR Camera" icon={<CameraAlt />} />
          <Tab label="Structure Info" icon={<Info />} />
        </Tabs>

        <AnimatePresence mode="wait">
          {activeTab === 0 && (
            <motion.div
              key="3d-preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ position: 'relative', height: '500px' }}>
                <Advanced3DHouseModel
                  roofDimensions={formData}
                  goal={formData.goal}
                  onRotate={(rotation) => console.log('Rotation:', rotation)}
                  onZoom={(zoom) => console.log('Zoom:', zoom)}
                />

                <Box sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  background: 'rgba(255,255,255,0.9)',
                  p: 2,
                  borderRadius: 2,
                  backdropFilter: 'blur(10px)'
                }}>
                  <Typography variant="h6" gutterBottom>
                    {results.recommended_structure.replace('_', ' ').toUpperCase()}
                  </Typography>
                  <Typography variant="body2">
                    📏 {results.dimensions.length}m × {results.dimensions.width}m × {results.dimensions.depth}m
                  </Typography>
                  <Typography variant="body2">
                    💧 {results.dimensions.volume.toLocaleString()} liters capacity
                  </Typography>
                  <Typography variant="body2">
                    💰 ₹{results.cost_estimation.total_cost.toLocaleString()} total cost
                  </Typography>
                </Box>

                <Box sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16
                }}>
                  <Fab
                    color="primary"
                    onClick={startARSession}
                    disabled={loading}
                    sx={{ mr: 1 }}
                  >
                    {loading ? <LinearProgress /> : <ViewInAr />}
                  </Fab>
                </Box>
              </Box>
            </motion.div>
          )}

          {activeTab === 1 && (
            <motion.div
              key="ar-camera"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ height: '500px', position: 'relative', bgcolor: 'black' }}>
                {cameraPermission === null && (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%',
                    color: 'white'
                  }}>
                    <CameraAlt sx={{ fontSize: '4rem', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      AR Camera View
                    </Typography>
                    <Button 
                      variant="contained" 
                      onClick={startARSession}
                      startIcon={<CameraAlt />}
                      size="large"
                    >
                      Start AR Session
                    </Button>
                  </Box>
                )}

                {cameraPermission === false && (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%',
                    color: 'white',
                    p: 3
                  }}>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      <AlertTitle>Camera Permission Required</AlertTitle>
                      Please allow camera access to use AR features.
                    </Alert>
                    <Button 
                      variant="contained" 
                      onClick={requestCameraPermission}
                      startIcon={<Refresh />}
                    >
                      Retry Camera Access
                    </Button>
                  </Box>
                )}

                {cameraPermission === true && (
                  <>
                    <video 
                      ref={videoRef}
                      autoPlay 
                      playsInline
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                      }}
                    />
                    <canvas 
                      ref={canvasRef}
                      style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%',
                        pointerEvents: 'none'
                      }}
                    />
                    
                    {/* AR Overlay */}
                    <Box sx={{ 
                      position: 'absolute', 
                      top: '50%', 
                      left: '50%', 
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                      color: 'white',
                      background: 'rgba(0,0,0,0.7)',
                      p: 2,
                      borderRadius: 2
                    }}>
                      <Typography variant="h6" gutterBottom>
                        🎯 Point camera at ground
                      </Typography>
                      <Typography variant="body2">
                        Your {results.recommended_structure.replace('_', ' ')} will appear here
                      </Typography>
                      <Chip 
                        label={`${results.dimensions.length}m × ${results.dimensions.width}m`}
                        color="primary"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </>
                )}
              </Box>
            </motion.div>
          )}

          {activeTab === 2 && (
            <motion.div
              key="structure-info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ p: 3 }}>
                <Card elevation={3} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      📐 Structure Specifications
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Type</Typography>
                        <Typography variant="h6">{results.recommended_structure.replace('_', ' ').toUpperCase()}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Dimensions</Typography>
                        <Typography variant="h6">
                          {results.dimensions.length} × {results.dimensions.width} × {results.dimensions.depth}m
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Volume</Typography>
                        <Typography variant="h6">{results.dimensions.volume.toLocaleString()} L</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Cost</Typography>
                        <Typography variant="h6">₹{results.cost_estimation.total_cost.toLocaleString()}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      🏗️ Construction Guidelines
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <AlertTitle>Before Construction</AlertTitle>
                        • Mark the area: {results.dimensions.length}m × {results.dimensions.width}m<br/>
                        • Ensure 1m clearance from boundaries<br/>
                        • Check for underground utilities<br/>
                        • Obtain necessary permissions
                      </Alert>
                      
                      <Alert severity="success" sx={{ mb: 2 }}>
                        <AlertTitle>Construction Steps</AlertTitle>
                        • Excavate to {results.dimensions.depth}m depth<br/>
                        • Install filter layers (gravel, sand, cloth)<br/>
                        • Connect inlet pipes from roof<br/>
                        • Add overflow outlet<br/>
                        • Cover with removable slab
                      </Alert>
                      
                      <Alert severity="warning">
                        <AlertTitle>Maintenance</AlertTitle>
                        • Clean filters every 6 months<br/>
                        • Remove silt annually<br/>
                        • Check pipe connections<br/>
                        • Monitor water quality
                      </Alert>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: 'white' }}>
        <Button onClick={shareAR} startIcon={<Share />}>
          Share AR View
        </Button>
        <Button startIcon={<Download />}>
          Download Plans
        </Button>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ARVisualization;
