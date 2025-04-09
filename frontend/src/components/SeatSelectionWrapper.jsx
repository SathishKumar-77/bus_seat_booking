import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SeatSelection from './SeatSelection';

const SeatSelectionWrapper = () => {
  const { busId } = useParams();
  const navigate = useNavigate();

  return <SeatSelection busId={parseInt(busId)} navigate={navigate} />;
};

export default SeatSelectionWrapper;