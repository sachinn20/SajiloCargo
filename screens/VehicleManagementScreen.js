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
  StatusBar,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import axios from '../utils/axiosInstance';
import { BRAND_COLOR } from './config';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

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
    Alert.alert(
      'Delete Vehicle', 
      'Are you sure you want to delete this vehicle? This action cannot be undone.', 
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => {}
        },
        {
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await axios.delete(`/vehicles/${id}`);
              Alert.alert('Success', 'Vehicle has been successfully deleted from your fleet.');
              fetchVehicles();
            } catch (error) {
              console.log(error);
              Alert.alert('Error', 'Could not delete the vehicle. Please try again later.');
            }
          }
        },
      ]
    );
  };

  const handleMarkAsMaintained = async (vehicleId) => {
    try {
      await axios.post(`/vehicles/${vehicleId}/maintain`);
      Alert.alert('Maintenance Complete', 'Vehicle has been successfully marked as maintained and is ready for service.');
      fetchVehicles(); // refresh the list
    } catch (error) {
      console.log(error);
      Alert.alert('Maintenance Error', 'Failed to mark vehicle as maintained. Please try again later.');
    }
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
      return Alert.alert('Validation Error', 'Please fill in all required fields to update this vehicle.');
    }
    try {
      await axios.put(`/vehicles/${editVehicle.id}`, editForm);
      Alert.alert('Update Successful', 'Vehicle information has been updated successfully.');
      setEditModalVisible(false);
      setEditVehicle(null);
      fetchVehicles();
    } catch (error) {
      console.log(error);
      Alert.alert('Update Failed', 'Could not update vehicle information. Please check your connection and try again.');
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

  const getMaintenanceStatus = (kmsRemaining, maintenanceDue) => {
    if (maintenanceDue) {
      return {
        color: '#FF3B30',
        text: 'Maintenance Required',
        icon: 'tools',
        bgColor: 'rgba(255, 59, 48, 0.1)'
      };
    } else if (kmsRemaining < 500) {
      return {
        color: '#FF9500',
        text: 'Maintenance Soon',
        icon: 'exclamation-triangle',
        bgColor: 'rgba(255, 149, 0, 0.1)'
      };
    } else {
      return {
        color: '#34C759',
        text: 'Good Condition',
        icon: 'check-circle',
        bgColor: 'rgba(52, 199, 89, 0.1)'
      };
    }
  };

  const renderItem = ({ item }) => {
    const maintenanceStatus = getMaintenanceStatus(item.kms_remaining_to_maintenance, item.maintenance_due);
    
    return (
      <View style={styles.vehicleCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.vehicleIconContainer, { backgroundColor: `${BRAND_COLOR}15` }]}>
            <MaterialCommunityIcons 
              name={getVehicleIcon(item.type)} 
              size={28} 
              color={BRAND_COLOR} 
            />
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={styles.vehicleText}>{item.type}</Text>
            <View style={styles.capacityBadge}>
              <Text style={styles.capacityText}>{item.capacity} kg</Text>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              onPress={() => openEditModal(item)} 
              style={[styles.iconButton, styles.editButton]}
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={16} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => handleDelete(item.id)}
              style={[styles.iconButton, styles.deleteButton]}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.vehicleDetails}>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="card-outline" size={16} color={BRAND_COLOR} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Plate Number</Text>
                <Text style={styles.detailValue}>{item.plate}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="document-text-outline" size={16} color={BRAND_COLOR} />
              </View>
              <View>
                <Text style={styles.detailLabel}>License</Text>
                <Text style={styles.detailValue}>{item.license}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="shield-checkmark-outline" size={16} color={BRAND_COLOR} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Insurance</Text>
                <Text style={styles.detailValue}>
                  {item.insurance || 'Not provided'}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="speedometer-outline" size={16} color={BRAND_COLOR} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Next Maintenance</Text>
                <Text style={[styles.detailValue, { color: maintenanceStatus.color }]}>
                  {item.kms_remaining_to_maintenance} km
                </Text>
              </View>
            </View>
          </View>
          
          <View style={[styles.maintenanceStatusContainer, { backgroundColor: maintenanceStatus.bgColor }]}>
            <FontAwesome5 name={maintenanceStatus.icon} size={16} color={maintenanceStatus.color} />
            <Text style={[styles.maintenanceStatusText, { color: maintenanceStatus.color }]}>
              {maintenanceStatus.text}
            </Text>
            
            {item.maintenance_due && (
              <TouchableOpacity
                onPress={() => handleMarkAsMaintained(item.id)}
                style={styles.maintainButton}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#34C759', '#30B350']}
                  style={styles.maintainButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="checkmark-circle-outline" size={16} color="#fff" style={{marginRight: 6}} />
                  <Text style={styles.maintainButtonText}>Complete Maintenance</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <MaterialCommunityIcons name="truck-fast-outline" size={60} color={BRAND_COLOR} />
      </View>
      <Text style={styles.emptyText}>No vehicles found</Text>
      <Text style={styles.emptySubText}>Add your first vehicle to get started</Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('AddVehicle')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[BRAND_COLOR, `${BRAND_COLOR}DD`]}
          style={styles.emptyAddButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="add-circle-outline" size={18} color="#fff" style={{marginRight: 8}} />
          <Text style={styles.emptyAddButtonText}>Add Vehicle</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back-outline" size={22} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>My Vehicles</Text>
          <Text style={styles.subtitle}>{vehicles.length} vehicles in your fleet</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={fetchVehicles}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh-outline" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLOR} />
          <Text style={styles.loadingText}>Loading your fleet...</Text>
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
        activeOpacity={0.9}
        onPress={() => navigation.navigate('AddVehicle')}
      >
        <LinearGradient
          colors={[BRAND_COLOR, `${BRAND_COLOR}DD`]}
          style={styles.addButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </LinearGradient>
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
            <LinearGradient
              colors={['#f8f9fa', '#f0f0f0']}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>Edit Vehicle Details</Text>
              <TouchableOpacity 
                onPress={() => setEditModalVisible(false)}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={22} color="#333" />
              </TouchableOpacity>
            </LinearGradient>

            {/* Scrollable Form */}
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              <View style={styles.formGroup}>
                <Text style={styles.label}>Vehicle Type</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="truck-outline" size={20} color={BRAND_COLOR} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Truck"
                    value={editForm.type}
                    onChangeText={(text) => handleEditChange('type', text)}
                    placeholderTextColor="#aaa"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Capacity (kg)</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="weight" size={20} color={BRAND_COLOR} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 1000"
                    keyboardType="numeric"
                    value={editForm.capacity}
                    onChangeText={(text) => handleEditChange('capacity', text)}
                    placeholderTextColor="#aaa"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Plate Number</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="card-outline" size={20} color={BRAND_COLOR} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. BA 2 PA 1234"
                    value={editForm.plate}
                    onChangeText={(text) => handleEditChange('plate', text)}
                    placeholderTextColor="#aaa"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>License Number</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="document-text-outline" size={20} color={BRAND_COLOR} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Transport license ID"
                    value={editForm.license}
                    onChangeText={(text) => handleEditChange('license', text)}
                    placeholderTextColor="#aaa"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Insurance (optional)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={BRAND_COLOR} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Insurance Number"
                    value={editForm.insurance}
                    onChangeText={(text) => handleEditChange('insurance', text)}
                    placeholderTextColor="#aaa"
                  />
                </View>
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleEditSubmit}
              >
                <LinearGradient
                  colors={[BRAND_COLOR, `${BRAND_COLOR}DD`]}
                  style={styles.saveButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="save-outline" size={18} color="#fff" style={{marginRight: 8}} />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </LinearGradient>
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  title: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#333',
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  vehicleCard: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  vehicleIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  vehicleText: { 
    fontSize: 18, 
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  capacityBadge: {
    backgroundColor: `${BRAND_COLOR}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  capacityText: {
    fontSize: 12,
    fontWeight: '600',
    color: BRAND_COLOR,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
  },
  vehicleDetails: {
    padding: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  detailItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingRight: 8,
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: `${BRAND_COLOR}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  maintenanceStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    flexWrap: 'wrap',
  },
  maintenanceStatusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  maintainButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    borderRadius: 8,
    overflow: 'hidden',
  },
  maintainButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  maintainButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: BRAND_COLOR,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  addButton: {
    position: 'absolute', 
    right: 20, 
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30, 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${BRAND_COLOR}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
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
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#333',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: { 
    fontWeight: '600', 
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
    paddingVertical: 14,
    paddingRight: 12,
    fontSize: 15,
    color: '#333',
  },
  modalFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 15,
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 15 
  },
});