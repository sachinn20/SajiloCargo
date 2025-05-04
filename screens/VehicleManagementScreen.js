// === Updated VehicleManagementScreen.js with styled Edit Modal ===
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import axios from '../utils/axiosInstance';
import { BRAND_COLOR } from './config';

const { width } = Dimensions.get('window');

const VehicleManagementScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [editForm, setEditForm] = useState({
    type: '',
    capacity: '',
    plate: '',
    license: '',
    insurance: '',
  });

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/vehicles');
      setVehicles(response.data);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to fetch vehicles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) fetchVehicles();
  }, [isFocused]);

  const handleDelete = (id) => {
    Alert.alert('Delete Vehicle', 'Are you sure you want to delete this vehicle?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await axios.delete(`/vehicles/${id}`);
            Alert.alert('Deleted', 'Vehicle has been deleted.');
            fetchVehicles();
          } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Could not delete the vehicle.');
          }
        }
      },
    ]);
  };

  const openEditModal = (vehicle) => {
    setEditVehicle(vehicle);
    setEditForm({
      type: vehicle.type,
      capacity: vehicle.capacity,
      plate: vehicle.plate,
      license: vehicle.license,
      insurance: vehicle.insurance || '',
    });
    setEditModalVisible(true);
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSubmit = async () => {
    if (!editVehicle) return;
    if (!editForm.type || !editForm.capacity || !editForm.plate || !editForm.license) {
      return Alert.alert('Validation', 'All required fields must be filled.');
    }
    try {
      await axios.put(`/vehicles/${editVehicle.id}`, editForm);
      Alert.alert('Updated', 'Vehicle updated successfully.');
      setEditModalVisible(false);
      setEditVehicle(null);
      fetchVehicles();
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Could not update vehicle.');
    }
  };

  const getVehicleIcon = (type) => {
    const lowerType = type?.toLowerCase() || '';
    
    if (lowerType.includes('truck')) {
      return 'truck';
    } else if (lowerType.includes('van')) {
      return 'van-utility';
    } else if (lowerType.includes('pickup')) {
      return 'truck-pickup';
    } else {
      return 'truck-delivery';
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.vehicleCard}>
      <View style={styles.vehicleIconContainer}>
        <MaterialCommunityIcons 
          name={getVehicleIcon(item.type)} 
          size={28} 
          color={BRAND_COLOR} 
        />
      </View>
      
      <View style={styles.vehicleDetails}>
        <View style={styles.vehicleHeaderRow}>
          <Text style={styles.vehicleText}>{item.type}</Text>
          <View style={styles.capacityBadge}>
            <Text style={styles.capacityText}>{item.capacity} kg</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="card-outline" size={14} color="#666" style={styles.infoIcon} />
          <Text style={styles.vehicleSub}>Plate: {item.plate}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="document-text-outline" size={14} color="#666" style={styles.infoIcon} />
          <Text style={styles.vehicleSub}>License: {item.license}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#666" style={styles.infoIcon} />
          {item.insurance ? (
            <Text style={styles.vehicleSub}>Insurance: {item.insurance}</Text>
          ) : (
            <Text style={[styles.vehicleSub, { fontStyle: 'italic', color: '#999' }]}>No insurance info</Text>
          )}
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          onPress={() => openEditModal(item)} 
          style={styles.editButton}
        >
          <Ionicons name="create-outline" size={18} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => handleDelete(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="truck-fast-outline" size={60} color="#ddd" />
      <Text style={styles.emptyText}>No vehicles found</Text>
      <Text style={styles.emptySubText}>Add your first vehicle to get started</Text>
      <TouchableOpacity
        style={styles.emptyAddButton}
        onPress={() => navigation.navigate('AddVehicle')}
      >
        <Text style={styles.emptyAddButtonText}>Add Vehicle</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back-outline" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>My Vehicles</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchVehicles}>
          <Ionicons name="refresh-outline" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLOR} />
          <Text style={styles.loadingText}>Loading vehicles...</Text>
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={EmptyListComponent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddVehicle')}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Edit Vehicle Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Vehicle</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Form */}
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              <View style={styles.formGroup}>
                <Text style={styles.label}>Vehicle Type</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="truck-outline" size={20} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Truck"
                    value={editForm.type}
                    onChangeText={(text) => handleEditChange('type', text)}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Capacity (kg)</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="weight" size={20} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 1000"
                    keyboardType="numeric"
                    value={editForm.capacity}
                    onChangeText={(text) => handleEditChange('capacity', text)}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Plate Number</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="card-outline" size={20} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. BA 2 PA 1234"
                    value={editForm.plate}
                    onChangeText={(text) => handleEditChange('plate', text)}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>License Number</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="document-text-outline" size={20} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Transport license ID"
                    value={editForm.license}
                    onChangeText={(text) => handleEditChange('license', text)}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Insurance (optional)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Insurance Number"
                    value={editForm.insurance}
                    onChangeText={(text) => handleEditChange('insurance', text)}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleEditSubmit}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
};

export default VehicleManagementScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa',
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  vehicleCard: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  vehicleIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  vehicleText: { 
    fontSize: 16, 
    fontWeight: '600',
    color: '#333',
  },
  capacityBadge: {
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  capacityText: {
    fontSize: 12,
    fontWeight: '600',
    color: BRAND_COLOR,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoIcon: {
    marginRight: 6,
  },
  vehicleSub: { 
    fontSize: 13, 
    color: '#666',
  },
  actionButtons: {
    justifyContent: 'space-between',
    paddingLeft: 12,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BRAND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ff4757',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    position: 'absolute', 
    right: 20, 
    bottom: 30,
    backgroundColor: BRAND_COLOR,
    width: 60,
    height: 60,
    borderRadius: 30, 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyAddButton: {
    backgroundColor: BRAND_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyAddButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: { 
    width: width * 0.9,
    maxHeight: '80%',
    backgroundColor: '#fff', 
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#333',
  },
  modalScrollContent: {
    padding: 20,
    // paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: { 
    fontWeight: '500', 
    marginBottom: 8, 
    color: '#333',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    fontSize: 15,
  },
  modalFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    backgroundColor: BRAND_COLOR,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 16 
  },
});