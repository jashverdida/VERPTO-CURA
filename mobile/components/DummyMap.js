import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING } from '../constants/theme';

// Dummy emergency markers with coordinates (Metro Manila area)
const DUMMY_INCIDENTS = [
  {
    id: 1,
    lat: 14.5601,
    lng: 121.0188,
    type: 'fire',
    title: 'Structural Fire',
    status: 'Verification Pending',
    address: 'Makati CBD, Metro Manila',
    reportedAt: '2 min ago',
    severity: 'Critical',
    description: 'Multi-story building fire reported. Smoke visible from street level.',
  },
  {
    id: 2,
    lat: 14.5868,
    lng: 121.0521,
    type: 'medical',
    title: 'Medical Emergency',
    status: 'Units Responding',
    address: 'Ortigas Center',
    reportedAt: '5 min ago',
    severity: 'Critical',
    description: 'Heart attack reported. CPR in progress by bystander.',
  },
  {
    id: 3,
    lat: 14.6091,
    lng: 121.0245,
    type: 'accident',
    title: 'Vehicle Collision',
    status: 'Assessment',
    address: 'EDSA, Quezon City',
    reportedAt: '8 min ago',
    severity: 'High',
    description: 'Multi-vehicle collision on highway. Traffic affected.',
  },
  {
    id: 4,
    lat: 14.5458,
    lng: 121.0442,
    type: 'rescue',
    title: 'Person Trapped',
    status: 'In Progress',
    address: 'BGC Tower 2, Fort Bonifacio',
    reportedAt: '12 min ago',
    severity: 'High',
    description: 'Individual trapped in elevator. Rescue team deployed.',
  },
  {
    id: 5,
    lat: 14.6352,
    lng: 121.0440,
    type: 'fire',
    title: 'Kitchen Fire',
    status: 'Contained',
    address: 'Quezon City, North',
    reportedAt: '15 min ago',
    severity: 'Medium',
    description: 'Small kitchen fire in apartment unit. Residents evacuated.',
  },
  {
    id: 6,
    lat: 14.5794,
    lng: 121.0774,
    type: 'medical',
    title: 'Emergency Response',
    status: 'On Scene',
    address: 'Pasig City',
    reportedAt: '20 min ago',
    severity: 'Medium',
    description: 'Diabetic patient requiring assistance.',
  },
];

const getMarkerColor = (type, severity) => {
  if (severity === 'Critical') return '#DC2626';
  if (type === 'fire') return '#EF4444';
  if (type === 'medical') return '#3B82F6';
  if (type === 'accident') return '#EAB308';
  if (type === 'rescue') return '#A855F7';
  return '#10B981';
};

// Generate HTML for Leaflet map
const generateMapHTML = (incidents, onMarkerClick) => {
  const markersJS = incidents.map(incident => {
    const color = getMarkerColor(incident.type, incident.severity);
    return `
      L.circleMarker([${incident.lat}, ${incident.lng}], {
        radius: 12,
        fillColor: '${color}',
        color: '#fff',
        weight: 3,
        opacity: 1,
        fillOpacity: 1
      }).addTo(map).on('click', function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({type: 'markerClick', id: ${incident.id}}));
      });
    `;
  }).join('\n');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #map { height: 100%; width: 100%; }
        .leaflet-control-attribution { font-size: 8px !important; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {
          zoomControl: true,
          attributionControl: true
        }).setView([14.5994, 121.0437], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(map);

        ${markersJS}
      </script>
    </body>
    </html>
  `;
};

export default function DummyMap({ onMarkerPress, style }) {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const webViewRef = useRef(null);

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'markerClick') {
        const incident = DUMMY_INCIDENTS.find(i => i.id === data.id);
        if (incident) {
          if (onMarkerPress) {
            onMarkerPress(incident);
          } else {
            setSelectedIncident(incident);
            setModalVisible(true);
          }
        }
      }
    } catch (e) {
      console.log('Error parsing message:', e);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedIncident(null);
  };

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Ionicons name="map" size={18} color={COLORS.white} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Emergency Response Map</Text>
            <Text style={styles.headerSubtitle}>Live incident tracking</Text>
          </View>
        </View>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live</Text>
        </View>
      </View>

      {/* Map WebView */}
      <View style={styles.mapArea}>
        <WebView
          ref={webViewRef}
          source={{ html: generateMapHTML(DUMMY_INCIDENTS) }}
          style={styles.webview}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
        />
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Fire/Critical</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.legendText}>Medical</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EAB308' }]} />
            <Text style={styles.legendText}>Accident</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#A855F7' }]} />
            <Text style={styles.legendText}>Rescue</Text>
          </View>
        </View>
        <Text style={styles.activeCount}>
          <Text style={styles.activeNumber}>{DUMMY_INCIDENTS.length}</Text> active
        </Text>
      </View>

      {/* Incident Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedIncident && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleRow}>
                    <Text style={styles.modalTitle}>{selectedIncident.title}</Text>
                    <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                      <Ionicons name="close" size={24} color={COLORS.slate500} />
                    </TouchableOpacity>
                  </View>
                  <View style={[styles.severityBadge, {
                    backgroundColor: selectedIncident.severity === 'Critical' ? '#FEE2E2' :
                                     selectedIncident.severity === 'High' ? '#FEF3C7' : '#E0F2FE'
                  }]}>
                    <Text style={[styles.severityText, {
                      color: selectedIncident.severity === 'Critical' ? '#DC2626' :
                             selectedIncident.severity === 'High' ? '#D97706' : '#0284C7'
                    }]}>{selectedIncident.severity} Priority</Text>
                  </View>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.detailRow}>
                    <Ionicons name="location" size={18} color={COLORS.emerald} />
                    <Text style={styles.detailText}>{selectedIncident.address}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="time" size={18} color={COLORS.emerald} />
                    <Text style={styles.detailText}>{selectedIncident.reportedAt}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="pulse" size={18} color={COLORS.emerald} />
                    <Text style={styles.detailText}>{selectedIncident.status}</Text>
                  </View>
                  <Text style={styles.description}>{selectedIncident.description}</Text>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="navigate" size={18} color={COLORS.emerald} />
                    <Text style={styles.actionButtonText}>Directions</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.primaryButton]}>
                    <Ionicons name="call" size={18} color={COLORS.white} />
                    <Text style={styles.primaryButtonText}>Contact</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.slate800,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.slate500,
    marginTop: 1,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.emerald + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.emerald,
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.emerald,
  },
  mapArea: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  webview: {
    flex: 1,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate100,
  },
  legendItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.slate600,
  },
  activeCount: {
    fontSize: 12,
    color: COLORS.slate500,
  },
  activeNumber: {
    fontWeight: '700',
    color: COLORS.emerald,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '70%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
  },
  modalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.slate900,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalBody: {
    padding: SPACING.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.slate700,
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: COLORS.slate600,
    lineHeight: 20,
    marginTop: SPACING.sm,
    backgroundColor: COLORS.slate50,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate100,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.emerald,
    gap: SPACING.xs,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.emerald,
  },
  primaryButton: {
    backgroundColor: COLORS.emerald,
    borderColor: COLORS.emerald,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});
