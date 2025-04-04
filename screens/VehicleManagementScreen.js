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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import axios from '../utils/axiosInstance';
import { BRAND_COLOR } from './config';

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
    if (isFocused) {
      fetchVehicles();
    }
  }, [isFocused]);

  const handleDelete = (id) => {
    Alert.alert('Delete Vehicle', 'Are you sure you want to delete this vehicle?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`/vehicles/${id}`);
            Alert.alert('Deleted', 'Vehicle has been deleted.');
            fetchVehicles();
          } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Could not delete the vehicle.');
          }
        },
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

  const renderItem = ({ item }) => (
    <View style={styles.vehicleCard}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.vehicleText}>{item.type} - {item.capacity}</Text>
          <Text style={styles.vehicleSub}>Plate: {item.plate}</Text>
          <Text style={styles.vehicleSub}>License: {item.license}</Text>
          {item.insurance ? (
            <Text style={styles.vehicleSub}>Insurance: {item.insurance}</Text>
          ) : (
            <Text style={[styles.vehicleSub, { fontStyle: 'italic', color: 'gray' }]}>
              No insurance info
            </Text>
          )}
        </View>
        <View style={{ justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => openEditModal(item)} style={{ marginBottom: 10 }}>
            <Ionicons name="create-outline" size={22} color={BRAND_COLOR} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash-outline" size={22} color="red" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color={BRAND_COLOR} />
        </TouchableOpacity>
        <Text style={styles.title}>My Vehicles</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={BRAND_COLOR} />
      ) : vehicles.length === 0 ? (
        <Text style={{ color: '#888', textAlign: 'center', marginTop: 20 }}>
          No vehicles found.
        </Text>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddVehicle')}
      >
        <Ionicons name="add-circle-outline" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add Vehicle</Text>
      </TouchableOpacity>

      {/* ✅ EDIT VEHICLE MODAL */}
      <Modal visible={editModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Ionicons name="close-outline" size={28} color="black" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Edit Vehicle</Text>

            <TextInput
              style={styles.input}
              placeholder="Type"
              value={editForm.type}
              onChangeText={(text) => handleEditChange('type', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Capacity"
              value={editForm.capacity}
              onChangeText={(text) => handleEditChange('capacity', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Plate"
              value={editForm.plate}
              onChangeText={(text) => handleEditChange('plate', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="License"
              value={editForm.license}
              onChangeText={(text) => handleEditChange('license', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Insurance (optional)"
              value={editForm.insurance}
              onChangeText={(text) => handleEditChange('insurance', text)}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleEditSubmit}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default VehicleManagementScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 12,
    color: BRAND_COLOR,
  },
  vehicleCard: {
    backgroundColor: '#f6f6f6',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  vehicleText: { fontSize: 16, fontWeight: 'bold' },
  vehicleSub: { fontSize: 13, color: '#555', marginTop: 4 },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: BRAND_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 6,
  },
  addButtonText: { color: '#fff', marginLeft: 8, fontWeight: '600' },

  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: BRAND_COLOR,
    marginVertical: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: BRAND_COLOR,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
