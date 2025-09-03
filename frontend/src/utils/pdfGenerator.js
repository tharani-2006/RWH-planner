import jsPDF from 'jspdf';

export const generateRWHPlan = (results, formData) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  
  // Colors
  const primaryColor = [25, 118, 210]; // Blue
  const secondaryColor = [46, 125, 50]; // Green
  const textColor = [33, 33, 33]; // Dark gray
  
  // Helper function to add colored text
  const addColoredText = (text, x, y, color = textColor, fontSize = 12) => {
    pdf.setTextColor(...color);
    pdf.setFontSize(fontSize);
    pdf.text(text, x, y);
  };
  
  // Header
  pdf.setFillColor(...primaryColor);
  pdf.rect(0, 0, pageWidth, 30, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont(undefined, 'bold');
  pdf.text('🏠 Rainwater Harvesting Plan', 20, 20);
  
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'normal');
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth - 80, 20);
  
  let yPos = 50;
  
  // Project Overview
  pdf.setTextColor(...primaryColor);
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.text('📋 Project Overview', 20, yPos);
  yPos += 15;
  
  pdf.setTextColor(...textColor);
  pdf.setFontSize(11);
  pdf.setFont(undefined, 'normal');
  
  const overviewData = [
    ['Location:', `${formData.locationName}, Erode District`],
    ['Goal:', formData.goal === 'storage' ? 'Rainwater Storage & Reuse' : 'Artificial Groundwater Recharge'],
    ['Roof Area:', `${formData.roofArea} m²`],
    ['Roof Type:', formData.roofType === 'non_absorptive' ? 'Non-Absorptive (Concrete/Metal)' : 'Absorptive (Mud/Porous)'],
    ['Household Size:', `${formData.householdSize} people`],
    ['Available Space:', `${formData.spaceLength}m × ${formData.spaceWidth}m`]
  ];
  
  overviewData.forEach(([label, value]) => {
    pdf.setFont(undefined, 'bold');
    pdf.text(label, 25, yPos);
    pdf.setFont(undefined, 'normal');
    pdf.text(value, 80, yPos);
    yPos += 8;
  });
  
  yPos += 10;
  
  // Recommended Solution
  pdf.setTextColor(...secondaryColor);
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.text('✅ Recommended Solution', 20, yPos);
  yPos += 15;
  
  // Structure details
  pdf.setTextColor(...textColor);
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text(`${results.recommended_structure.replace('_', ' ').toUpperCase()}`, 25, yPos);
  yPos += 10;
  
  pdf.setFontSize(11);
  pdf.setFont(undefined, 'normal');
  pdf.text(results.recommendation_reason, 25, yPos, { maxWidth: pageWidth - 50 });
  yPos += 20;
  
  // Technical Specifications
  pdf.setTextColor(...primaryColor);
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('🔧 Technical Specifications', 20, yPos);
  yPos += 15;
  
  const techSpecs = [
    ['Dimensions:', `${results.dimensions.length}m × ${results.dimensions.width}m × ${results.dimensions.depth}m`],
    ['Storage Capacity:', `${results.dimensions.volume.toLocaleString()} liters`],
    ['Annual Harvestable:', `${results.water_harvesting.annual_harvestable.toLocaleString()} liters`],
    ['Roof Efficiency:', `${(results.water_harvesting.roof_efficiency * 100).toFixed(1)}%`],
    ['Effective Collection:', `${results.water_harvesting.roof_adjusted_harvestable.toLocaleString()} liters/year`]
  ];
  
  pdf.setTextColor(...textColor);
  pdf.setFontSize(11);
  
  techSpecs.forEach(([label, value]) => {
    pdf.setFont(undefined, 'bold');
    pdf.text(label, 25, yPos);
    pdf.setFont(undefined, 'normal');
    pdf.text(value, 90, yPos);
    yPos += 8;
  });
  
  yPos += 10;
  
  // Cost Analysis
  pdf.setTextColor(...primaryColor);
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('💰 Cost Analysis', 20, yPos);
  yPos += 15;
  
  pdf.setTextColor(...textColor);
  pdf.setFontSize(11);
  
  const costData = [
    ['Total Project Cost:', `₹${results.cost_estimation.total_cost.toLocaleString()}`],
    ['Cost per Liter:', `₹${results.cost_estimation.cost_per_liter}`],
    ['Payback Period:', `${results.cost_estimation.payback_period_years} years`],
    ['Annual Maintenance:', `₹${results.cost_estimation.breakdown.annualMaintenance.toLocaleString()}`]
  ];
  
  costData.forEach(([label, value]) => {
    pdf.setFont(undefined, 'bold');
    pdf.text(label, 25, yPos);
    pdf.setFont(undefined, 'normal');
    pdf.text(value, 90, yPos);
    yPos += 8;
  });
  
  // Cost Breakdown
  if (results.cost_estimation.breakdown) {
    yPos += 10;
    pdf.setFont(undefined, 'bold');
    pdf.text('Cost Breakdown:', 25, yPos);
    yPos += 8;
    
    pdf.setFont(undefined, 'normal');
    Object.entries(results.cost_estimation.breakdown).forEach(([key, value]) => {
      if (typeof value === 'number' && value > 0) {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        pdf.text(`• ${label}: ₹${value.toLocaleString()}`, 30, yPos);
        yPos += 6;
      }
    });
  }
  
  // New page for implementation details
  pdf.addPage();
  yPos = 30;
  
  // Implementation Guidelines
  pdf.setTextColor(...primaryColor);
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.text('🚧 Implementation Guidelines', 20, yPos);
  yPos += 20;
  
  pdf.setTextColor(...textColor);
  pdf.setFontSize(11);
  pdf.setFont(undefined, 'normal');
  
  const guidelines = formData.goal === 'storage' ? [
    '1. Site Preparation:',
    '   • Ensure rooftop can support tank weight when full',
    '   • Check structural integrity and load-bearing capacity',
    '   • Plan for easy access for maintenance',
    '',
    '2. Tank Installation:',
    '   • Install tank on level, stable platform',
    '   • Ensure proper slope for drainage',
    '   • Connect overflow pipe to drainage system',
    '',
    '3. Piping System:',
    '   • Install first flush diverter',
    '   • Use food-grade pipes for potable water',
    '   • Install filters at inlet and outlet',
    '',
    '4. Maintenance Schedule:',
    '   • Clean tank every 6 months',
    '   • Replace filters annually',
    '   • Check pipes for leaks monthly'
  ] : [
    '1. Excavation:',
    '   • Mark the area as per dimensions',
    '   • Excavate to specified depth',
    '   • Ensure proper slope towards pit',
    '',
    '2. Filter Media Installation:',
    '   • Layer 1: Coarse gravel (bottom)',
    '   • Layer 2: Fine gravel (middle)',
    '   • Layer 3: Coarse sand (top)',
    '',
    '3. Inlet System:',
    '   • Install inlet pipe with proper slope',
    '   • Add first flush diverter',
    '   • Ensure overflow arrangement',
    '',
    '4. Maintenance Schedule:',
    '   • Desilt pit annually before monsoon',
    '   • Replace filter media every 2-3 years',
    '   • Check inlet pipes for blockages'
  ];
  
  guidelines.forEach(line => {
    if (line.startsWith('   •') || line.startsWith('   ')) {
      pdf.text(line, 25, yPos);
    } else if (line.match(/^\d+\./)) {
      pdf.setFont(undefined, 'bold');
      pdf.text(line, 20, yPos);
      pdf.setFont(undefined, 'normal');
    } else {
      pdf.text(line, 20, yPos);
    }
    yPos += 6;
    
    if (yPos > pageHeight - 30) {
      pdf.addPage();
      yPos = 30;
    }
  });
  
  // Footer
  const addFooter = (pageNum) => {
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`RWH-Erode Smart Planning System | Page ${pageNum}`, 20, pageHeight - 10);
    pdf.text('Generated by AI-powered analysis', pageWidth - 80, pageHeight - 10);
  };
  
  // Add footers to all pages
  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    addFooter(i);
  }
  
  return pdf;
};

export const downloadPDF = (results, formData) => {
  const pdf = generateRWHPlan(results, formData);
  const filename = `RWH_Plan_${formData.locationName}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
};

export const generateDOC = (results, formData) => {
  // Generate HTML content for DOC export
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Rainwater Harvesting Plan</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #1976d2; color: white; padding: 20px; margin: -40px -40px 30px -40px; }
        .section { margin: 20px 0; }
        .section h2 { color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 5px; }
        .spec-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        .spec-table td { padding: 8px; border-bottom: 1px solid #ddd; }
        .spec-table td:first-child { font-weight: bold; width: 200px; }
        .cost-breakdown { background: #f5f5f5; padding: 15px; margin: 10px 0; }
        .guidelines { line-height: 1.6; }
        .guidelines ol { padding-left: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🏠 Rainwater Harvesting Plan</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
      </div>
      
      <div class="section">
        <h2>📋 Project Overview</h2>
        <table class="spec-table">
          <tr><td>Location:</td><td>${formData.locationName}, Erode District</td></tr>
          <tr><td>Goal:</td><td>${formData.goal === 'storage' ? 'Rainwater Storage & Reuse' : 'Artificial Groundwater Recharge'}</td></tr>
          <tr><td>Roof Area:</td><td>${formData.roofArea} m²</td></tr>
          <tr><td>Roof Type:</td><td>${formData.roofType === 'non_absorptive' ? 'Non-Absorptive (Concrete/Metal)' : 'Absorptive (Mud/Porous)'}</td></tr>
          <tr><td>Household Size:</td><td>${formData.householdSize} people</td></tr>
          <tr><td>Available Space:</td><td>${formData.spaceLength}m × ${formData.spaceWidth}m</td></tr>
        </table>
      </div>
      
      <div class="section">
        <h2>✅ Recommended Solution</h2>
        <h3>${results.recommended_structure.replace('_', ' ').toUpperCase()}</h3>
        <p>${results.recommendation_reason}</p>
      </div>
      
      <div class="section">
        <h2>🔧 Technical Specifications</h2>
        <table class="spec-table">
          <tr><td>Dimensions:</td><td>${results.dimensions.length}m × ${results.dimensions.width}m × ${results.dimensions.depth}m</td></tr>
          <tr><td>Storage Capacity:</td><td>${results.dimensions.volume.toLocaleString()} liters</td></tr>
          <tr><td>Annual Harvestable:</td><td>${results.water_harvesting.annual_harvestable.toLocaleString()} liters</td></tr>
          <tr><td>Roof Efficiency:</td><td>${(results.water_harvesting.roof_efficiency * 100).toFixed(1)}%</td></tr>
          <tr><td>Effective Collection:</td><td>${results.water_harvesting.roof_adjusted_harvestable.toLocaleString()} liters/year</td></tr>
        </table>
      </div>
      
      <div class="section">
        <h2>💰 Cost Analysis</h2>
        <table class="spec-table">
          <tr><td>Total Project Cost:</td><td>₹${results.cost_estimation.total_cost.toLocaleString()}</td></tr>
          <tr><td>Cost per Liter:</td><td>₹${results.cost_estimation.cost_per_liter}</td></tr>
          <tr><td>Payback Period:</td><td>${results.cost_estimation.payback_period_years} years</td></tr>
          <tr><td>Annual Maintenance:</td><td>₹${results.cost_estimation.breakdown.annualMaintenance.toLocaleString()}</td></tr>
        </table>
      </div>
      
      <div class="section">
        <h2>🚧 Implementation Guidelines</h2>
        <div class="guidelines">
          ${formData.goal === 'storage' ? `
            <ol>
              <li><strong>Site Preparation:</strong>
                <ul>
                  <li>Ensure rooftop can support tank weight when full</li>
                  <li>Check structural integrity and load-bearing capacity</li>
                  <li>Plan for easy access for maintenance</li>
                </ul>
              </li>
              <li><strong>Tank Installation:</strong>
                <ul>
                  <li>Install tank on level, stable platform</li>
                  <li>Ensure proper slope for drainage</li>
                  <li>Connect overflow pipe to drainage system</li>
                </ul>
              </li>
              <li><strong>Piping System:</strong>
                <ul>
                  <li>Install first flush diverter</li>
                  <li>Use food-grade pipes for potable water</li>
                  <li>Install filters at inlet and outlet</li>
                </ul>
              </li>
              <li><strong>Maintenance Schedule:</strong>
                <ul>
                  <li>Clean tank every 6 months</li>
                  <li>Replace filters annually</li>
                  <li>Check pipes for leaks monthly</li>
                </ul>
              </li>
            </ol>
          ` : `
            <ol>
              <li><strong>Excavation:</strong>
                <ul>
                  <li>Mark the area as per dimensions</li>
                  <li>Excavate to specified depth</li>
                  <li>Ensure proper slope towards pit</li>
                </ul>
              </li>
              <li><strong>Filter Media Installation:</strong>
                <ul>
                  <li>Layer 1: Coarse gravel (bottom)</li>
                  <li>Layer 2: Fine gravel (middle)</li>
                  <li>Layer 3: Coarse sand (top)</li>
                </ul>
              </li>
              <li><strong>Inlet System:</strong>
                <ul>
                  <li>Install inlet pipe with proper slope</li>
                  <li>Add first flush diverter</li>
                  <li>Ensure overflow arrangement</li>
                </ul>
              </li>
              <li><strong>Maintenance Schedule:</strong>
                <ul>
                  <li>Desilt pit annually before monsoon</li>
                  <li>Replace filter media every 2-3 years</li>
                  <li>Check inlet pipes for blockages</li>
                </ul>
              </li>
            </ol>
          `}
        </div>
      </div>
    </body>
    </html>
  `;
  
  // Create and download DOC file
  const blob = new Blob([htmlContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `RWH_Plan_${formData.locationName}_${new Date().toISOString().split('T')[0]}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
