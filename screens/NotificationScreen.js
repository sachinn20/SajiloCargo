import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image
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

  const fetchNotifications = async () => {
    try {
      await axios.post('/notifications/mark-all-read'); // mark as read
      const response = await axios.get('/notifications');
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.log('Failed to load notifications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const renderItem = ({ item }) => {
    const isUnread = !item.read_at;
    const icon = getNotificationIcon(item.title);

    const profileImage = item.actor?.profile_photo
      ? `${BASE_URL}/storage/${item.actor.profile_photo}`
      : 'https://via.placeholder.com/100';

    return (
      <View style={[styles.notificationCard, isUnread && styles.unreadCard]}>
        <Image source={{ uri: profileImage }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <View style={styles.messageRow}>
            {icon}
            <Text style={styles.messageText}>
              <Text style={styles.titleText}>{item.title}</Text> — {item.message}
            </Text>
          </View>
          <Text style={styles.time}>{dayjs(item.created_at).fromNow()}</Text>
        </View>
      </View>
    );
  };

  const getNotificationIcon = (title) => {
    const lower = title.toLowerCase();
    if (lower.includes('booking')) {
      return <Ionicons name="cube-outline" size={18} color={BRAND_COLOR} style={styles.icon} />;
    } else if (lower.includes('trip')) {
      return <Ionicons name="map-outline" size={18} color={BRAND_COLOR} style={styles.icon} />;
    } else {
      return <MaterialCommunityIcons name="bell-outline" size={18} color={BRAND_COLOR} style={styles.icon} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color={BRAND_COLOR} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={BRAND_COLOR} />
      ) : notifications.length === 0 ? (
        <Text style={styles.emptyText}>No notifications found.</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  unreadCard: {
    backgroundColor: '#eaf6ff',
  },
  avatar: {
    height: 44,
    width: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  messageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    marginRight: 6,
  },
  titleText: {
    fontWeight: 'bold',
  },
  messageText: {
    flexShrink: 1,
    color: '#333',
    fontSize: 14,
  },
  time: {
    fontSize: 12,
    color: '#888',
  },
});
