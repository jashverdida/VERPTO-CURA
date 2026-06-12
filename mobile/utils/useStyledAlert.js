import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';

export const useStyledAlert = () => {
  const [alertModal, setAlertModal] = useState({
    visible: false,
    title: '',
    message: '',
    icon: 'information-circle',
    color: COLORS.emerald,
    onConfirm: null,
    isConfirmation: false,
  });

  const showAlert = (title, message, icon = 'information-circle', color = COLORS.emerald, onConfirm = null, isConfirmation = false) => {
    setAlertModal({ visible: true, title, message, icon, color, onConfirm, isConfirmation });
  };

  const closeAlert = () => {
    setAlertModal({
      visible: false,
      title: '',
      message: '',
      icon: 'information-circle',
      color: COLORS.emerald,
      onConfirm: null,
      isConfirmation: false,
    });
  };

  const AlertComponent = () => (
    <Modal animationType="fade" transparent={true} visible={alertModal.visible} onRequestClose={closeAlert}>
      <TouchableOpacity style={styles.alertOverlay} activeOpacity={1} onPress={!alertModal.isConfirmation ? closeAlert : undefined}>
        <View style={[styles.alertContent, { shadowColor: alertModal.color }]}>
          <View style={[styles.alertIconWrapper, { backgroundColor: `${alertModal.color}15` }]}>
            <Ionicons name={alertModal.icon} size={32} color={alertModal.color} />
          </View>
          <Text style={styles.alertTitle}>{alertModal.title}</Text>
          <Text style={styles.alertMessage}>{alertModal.message}</Text>
          {alertModal.isConfirmation ? (
            <View style={styles.alertButtonGroup}>
              <TouchableOpacity 
                style={[styles.alertButton, styles.alertButtonSecondary, { borderColor: 'rgba(255,255,255,0.2)' }]} 
                onPress={closeAlert}
              >
                <Text style={[styles.alertButtonText, { color: 'rgba(255,255,255,0.6)' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.alertButton, { borderColor: alertModal.color }]} 
                onPress={() => {
                  alertModal.onConfirm?.();
                  closeAlert();
                }}
              >
                <Text style={[styles.alertButtonText, { color: alertModal.color }]}>Proceed</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={[styles.alertButton, styles.singleButton, { borderColor: alertModal.color }]} onPress={closeAlert}>
              <Text style={[styles.alertButtonText, { color: alertModal.color }]}>Okay</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return { showAlert, closeAlert, AlertComponent, alertState: alertModal };
};

const styles = StyleSheet.create({
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  alertContent: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    maxWidth: 320,
    shadowOffset: { width: -3, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  alertIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  alertTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: SPACING.xl,
    textAlign: 'center',
    lineHeight: 20,
  },
  alertButtonGroup: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  alertButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  singleButton: {
    flex: 0,
    width: '100%',
  },
  alertButtonSecondary: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  alertButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    textAlign: 'center',
  },
});
