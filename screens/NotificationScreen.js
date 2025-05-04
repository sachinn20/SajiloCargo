import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image,
  StatusBar, Animated, RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from '../utils/axiosInstance';
import { BASE_URL, BRAND_COLOR } from './config';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollY = new Animated.Value(0);

  const fetchNotifications = async () => {
    setLoading(true); // Add this line to show spinner when refreshing
    try {
      await axios.post('/notifications/mark-all-read');
      const response = await axios.get('/notifications');
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.log('Failed to load notifications', error);
    } finally {
      setLoading(false); // Turn off spinner
    }
  };
  

  useEffect(() => {
    fetchNotifications();
  }, []);

  const renderItem = ({ item, index }) => {
    const isUnread = !item.read_at;
    const icon = getNotificationIcon(item.title);

    const profileImage = item.actor?.profile_photo
      ? `${BASE_URL}/storage/${item.actor.profile_photo}`
      : 'https://via.placeholder.com/100';

    return (
      <Animated.View 
        style={[
          styles.notificationCard, 
          isUnread && styles.unreadCard,
        ]}
      >
        {isUnread && <View style={styles.unreadIndicator} />}
        <View style={styles.avatarContainer}>
          <Image source={{ uri: profileImage }} style={styles.avatar} />
          <View style={styles.iconOverlay}>
            {icon}
          </View>
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.titleText}>{item.title}</Text>
          <Text style={styles.messageText}>{item.message}</Text>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={12} color="#888" style={{marginRight: 4}} />
            <Text style={styles.time}>{dayjs(item.created_at).fromNow()}</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const getNotificationIcon = (title) => {
    const lower = title.toLowerCase();
    if (lower.includes('booking')) {
      return <Ionicons name="cube-outline" size={16} color="#fff" />;
    } else if (lower.includes('trip')) {
      return <Ionicons name="map-outline" size={16} color="#fff" />;
    } else {
      return <MaterialCommunityIcons name="bell-outline" size={16} color="#fff" />;
    }
  };

  const getIconBackgroundColor = (title) => {
    const lower = title.toLowerCase();
    if (lower.includes('booking')) {
      return '#4e7df7';
    } else if (lower.includes('trip')) {
      return '#f7934e';
    } else {
      return '#7d4ef7';
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <Animated.View style={[
        styles.headerShadow,
        { opacity: headerOpacity }
      ]} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back-outline" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchNotifications}>
          <Ionicons name="refresh-outline" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={BRAND_COLOR} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="bell-off-outline" size={80} color="#ddd" />
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptyText}>You don't have any notifications at the moment.</Text>
          <TouchableOpacity 
            style={styles.refreshEmptyButton}
            onPress={fetchNotifications}
          >
            <Text style={styles.refreshEmptyText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchNotifications}
              colors={[BRAND_COLOR]}
              tintColor={BRAND_COLOR}
            />
          }
        />

      )}
    </SafeAreaView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    zIndex: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    marginBottom: 24,
  },
  refreshEmptyButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: BRAND_COLOR,
    borderRadius: 8,
  },
  refreshEmptyText: {
    color: '#fff',
    fontWeight: '600',
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  unreadCard: {
    backgroundColor: '#fff',
    borderLeftWidth: 0,
  },
  unreadIndicator: {
    position: 'absolute',
    left: 0,
    top: 16,
    bottom: 16,
    width: 4,
    backgroundColor: BRAND_COLOR,
    borderRadius: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  iconOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: BRAND_COLOR,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    paddingRight: 8,
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  messageText: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 12,
    color: '#888',
  },
});