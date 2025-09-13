import React from 'react';
import { render } from '@testing-library/react';
import GanttChart from '../GanttChart';

describe('GanttChart', () => {
  it('renders without crashing', () => {
    render(<GanttChart />);
  });
});
