import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  TextInput,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from '../utils/axiosInstance';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useMemo } from 'react'; // At the top

// ❌ Remove this line completely:
// const [filteredBookings, setFilteredBookings] = useState([]);



const EarningsScreen = () => {
  const [bookings, setBookings] = useState([]);
  // const [filteredBookings, setFilteredBookings] = useState([]);
  
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter and search states
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'paid', 'unpaid'
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Reference to the search input
  const searchInputRef = useRef(null);

  const fetchEarnings = useCallback(async () => {
  try {
    setLoading(true);
    const res = await axios.get('/earnings');
    setBookings(res.data.bookings); // ✅ Keep only this
    setTotal(res.data.total);
  } catch (err) {
    console.error('Error fetching earnings:', err);
    Alert.alert('Error', 'Failed to load earnings. Please try again.');
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, []);


  // Apply filters and search
  const filteredBookings = useMemo(() => {
  let result = [...bookings];

  if (activeFilter === 'paid') {
    result = result.filter((booking) => booking.is_paid);
  } else if (activeFilter === 'unpaid') {
    result = result.filter((booking) => !booking.is_paid);
  }

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    result = result.filter(
      (booking) =>
        booking.tracking_no?.toLowerCase().includes(query) ||
        booking.customer_name?.toLowerCase().includes(query)
    );
  }

  return result;
}, [bookings, activeFilter, searchQuery]);


  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEarnings();
  }, [fetchEarnings]);

  const markAsPaid = async (id) => {
    try {
      Alert.alert(
        'Confirm Payment',
        'Are you sure you want to mark this booking as paid?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Yes, Mark as Paid', 
            onPress: async () => {
              setLoading(true);
              await axios.put(`/bookings/${id}/mark-paid`);
              fetchEarnings();
              Alert.alert('Success', 'Payment marked as received.');
            } 
          }
        ]
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to mark as paid. Please try again.');
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.trackingContainer}>
          <Text style={styles.trackingLabel}>Tracking #</Text>
          <Text style={styles.trackingNumber}>{item.tracking_no}</Text>
        </View>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: item.is_paid ? '#e6f7ee' : '#fff0f0' }
        ]}>
          <Ionicons 
            name={item.is_paid ? "checkmark-circle" : "time-outline"} 
            size={16} 
            color={item.is_paid ? "#22c55e" : "#ef4444"} 
          />
          <Text style={[
            styles.statusText, 
            { color: item.is_paid ? "#22c55e" : "#ef4444" }
          ]}>
            {item.is_paid ? 'Paid' : 'Unpaid'}
          </Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="person-outline" size={16} color="#6b7280" style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Customer</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{item.customer_name}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="wallet-outline" size={16} color="#6b7280" style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Payment Mode</Text>
            <Text style={styles.infoValue}>
              {item.payment_mode === 'cash' ? 'Cash' : 'Online'}
            </Text>
          </View>
        </View>
        
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amountValue}>Rs. {item.amount.toLocaleString()}</Text>
        </View>
      </View>
      
      {!item.is_paid && item.payment_mode === 'cash' && (
        <TouchableOpacity 
          style={styles.payBtn} 
          onPress={() => markAsPaid(item.id)}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle" size={16} color="#fff" />
          <Text style={styles.payText}>Mark as Paid</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmptyList = () => {
    if (loading) return null;
    
    // Different empty states for search vs. no data
    if (searchQuery.trim() || activeFilter !== 'all') {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="search-outline" size={64} color="#d1d5db" />
          </View>
          <Text style={styles.emptyTitle}>No Results Found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your search or filter to find what you're looking for.
          </Text>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={() => {
              setSearchQuery('');
              setActiveFilter('all');
            }}
          >
            <Text style={styles.resetButtonText}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="wallet-outline" size={64} color="#d1d5db" />
        </View>
        <Text style={styles.emptyTitle}>No Earnings Yet</Text>
        <Text style={styles.emptySubtitle}>
          Your earnings will appear here once you start receiving payments.
        </Text>
      </View>
    );
  };

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={[
        styles.searchInputContainer,
        isSearchFocused && styles.searchInputContainerFocused
      ]}>
        <Ionicons name="search-outline" size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="Search tracking # or customer"
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={handleSearchChange}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="never" // Important for iOS
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={18} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterTab, activeFilter === 'all' && styles.activeFilterTab]}
        onPress={() => setActiveFilter('all')}
      >
        <Text style={[
          styles.filterTabText, 
          activeFilter === 'all' && styles.activeFilterTabText
        ]}>
          All
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.filterTab, activeFilter === 'paid' && styles.activeFilterTab]}
        onPress={() => setActiveFilter('paid')}
      >
        <Ionicons 
          name="checkmark-circle" 
          size={14} 
          color={activeFilter === 'paid' ? "#004aad" : "#6b7280"} 
          style={styles.filterTabIcon}
        />
        <Text style={[
          styles.filterTabText, 
          activeFilter === 'paid' && styles.activeFilterTabText
        ]}>
          Paid
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.filterTab, activeFilter === 'unpaid' && styles.activeFilterTab]}
        onPress={() => setActiveFilter('unpaid')}
      >
        <Ionicons 
          name="time-outline" 
          size={14} 
          color={activeFilter === 'unpaid' ? "#004aad" : "#6b7280"} 
          style={styles.filterTabIcon}
        />
        <Text style={[
          styles.filterTabText, 
          activeFilter === 'unpaid' && styles.activeFilterTabText
        ]}>
          Unpaid
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.totalCard}>
        <View style={styles.totalTextContainer}>
          <Text style={styles.totalLabel}>Total Earnings</Text>
          <Text style={styles.totalValue}>Rs. {total.toLocaleString()}</Text>
        </View>
        <View style={styles.totalIconContainer}>
          <Ionicons name="wallet" size={32} color="#fff" />
        </View>
      </View>
      
      {renderSearchBar()}
      {renderFilterTabs()}
      
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Transactions</Text>
        <Text style={styles.listSubtitle}>
          {filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'}
        </Text>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ActivityIndicator size="large" color="#004aad" />
        <Text style={styles.loadingText}>Loading earnings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>My Earnings</Text>
      </View>
      
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyList}
        keyboardShouldPersistTaps="handled" // Important for keyboard persistence
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#004aad']}
            tintColor="#004aad"
          />
        }
      />
    </SafeAreaView>
  );
};

export default EarningsScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f7fa'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280'
  },
  screenHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827'
  },
  listContainer: {
    paddingBottom: 100,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  totalCard: {
    backgroundColor: '#004aad',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  totalTextContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  totalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Search bar styles
  searchContainer: {
    marginBottom: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    height: 44,
  },
  searchInputContainerFocused: {
    borderColor: '#004aad',
    shadowColor: '#004aad',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    height: '100%',
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  // Filter tabs styles
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    flexDirection: 'row',
  },
  activeFilterTab: {
    backgroundColor: '#ebe9ff',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeFilterTabText: {
    color: '#004aad',
    fontWeight: '600',
  },
  filterTabIcon: {
    marginRight: 4,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  listSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  trackingContainer: {
    flex: 1,
  },
  trackingLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  trackingNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'monospace',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 16,
  },
  cardBody: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
  },
  infoIcon: {
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  amountContainer: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  amountLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#22c55e',
  },
  payBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  payText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  resetButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#ebe9ff',
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#004aad',
    fontWeight: '600',
    fontSize: 14,
  },
});