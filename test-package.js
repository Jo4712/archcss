#!/usr/bin/env node

/**
 * Test script for @archcss/parser package
 * Tests the package functionality before publishing
 */

import { parse, compile, generateCSS, mount } from './packages/parser/dist/index.js';

console.log('🧪 Testing @archcss/parser package...\n');

// Test source code
const source = `
@unit 1U = 50px;
@draw MyHome {
  @canvas 20U x 12U;
  
  room living at (1U, 1U) size (6U, 4U) {
    label: "Living Room";
    background: #f0f0f0;
    border-radius: 8px;
  }
  
  room kitchen at (8U, 1U) size (5U, 3U) {
    label: "Kitchen";
    background: #e0f0e0;
  }
  
  wall from (7U, 1U) to (7U, 4U);
  door from (7U, 2U) to (7U, 3U) width 0.9U;
}
`;

try {
  console.log('1. Parsing source code...');
  const ast = parse(source);
  console.log('✅ Parse successful');
  console.log(`   - Found ${ast.drawings.length} drawing(s)`);
  console.log(`   - Found ${ast.units.length} unit declaration(s)`);
  
  console.log('\n2. Compiling to model...');
  const model = compile(ast);
  console.log('✅ Compilation successful');
  console.log(`   - Scale: ${model.scale}px`);
  console.log(`   - Canvas: ${model.canvas.cols}U x ${model.canvas.rows}U`);
  console.log(`   - Rooms: ${model.rooms.length}`);
  console.log(`   - Walls: ${model.walls.length}`);
  console.log(`   - Doors: ${model.doors.length}`);
  
  console.log('\n3. Generating CSS...');
  const css = generateCSS(model);
  console.log('✅ CSS generation successful');
  console.log(`   - CSS length: ${css.length} characters`);
  console.log(`   - Contains custom properties: ${css.includes('--u')}`);
  console.log(`   - Contains grid layout: ${css.includes('display: grid')}`);
  
  console.log('\n4. Testing mount function...');
  // Create a test container
  const testContainer = document.createElement('div');
  testContainer.id = 'test-plan';
  document.body.appendChild(testContainer);
  
  mount('#test-plan', model);
  const planElement = document.getElementById('test-plan');
  const rooms = planElement.querySelectorAll('.room');
  
  console.log('✅ Mount successful');
  console.log(`   - Plan element created: ${!!planElement}`);
  console.log(`   - Rooms mounted: ${rooms.length}`);
  console.log(`   - CSS applied: ${planElement.style.display === 'grid'}`);
  
  // Clean up
  document.body.removeChild(testContainer);
  
  console.log('\n🎉 All tests passed! Package is ready for publishing.');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
