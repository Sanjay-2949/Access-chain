'use client';

import React from 'react';
import { GoogleMapsLocationPicker, LocationData } from './GoogleMapsLocationPicker';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  title?: string;
  initialLocationName?: string;
  initialLat?: number;
  initialLng?: number;
  onConfirm: (location: LocationData) => void;
  onClose: () => void;
}

export const LocationPickerModal: React.FC<Props> = ({
  isOpen,
  title = 'Select Location on Map',
  initialLocationName,
  initialLat,
  initialLng,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-4xl"
        >
          <GoogleMapsLocationPicker
            title={title}
            initialLocationName={initialLocationName}
            initialLat={initialLat}
            initialLng={initialLng}
            onConfirm={(location) => {
              onConfirm(location);
              onClose();
            }}
            onClose={onClose}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
