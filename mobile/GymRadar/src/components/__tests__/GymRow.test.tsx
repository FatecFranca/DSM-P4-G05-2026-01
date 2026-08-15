import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import GymRow from '../GymRow';

const gym = { id: '1', name: 'SmartFit Centro', capacity: 100, occupancy: 25 };

describe('GymRow', () => {
  it('renders the gym name and occupancy', async () => {
    await render(<GymRow gym={gym} />);
    expect(screen.getByText('SmartFit Centro')).toBeTruthy();
    expect(screen.getByText('25/100')).toBeTruthy();
  });

  it('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    await render(<GymRow gym={gym} onPress={onPress} />);
    fireEvent.press(screen.getByText('SmartFit Centro'));
    expect(onPress).toHaveBeenCalled();
  });
});
