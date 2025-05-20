import React, { useState, useEffect, useRef } from 'react';
import {
  View, TextInput, FlatList, Text,
  TouchableOpacity, StyleSheet, Image,
  KeyboardAvoidingView, Platform, SafeAreaView,
  ActivityIndicator, Animated, Dimensions,
  Keyboard
} from 'react-native';
import axios from './axiosInstance';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BRAND_COLOR } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const CustomChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const navigation = useNavigation();
  const listRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    // Fetch user profile
    const fetchUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          const response = await axios.get('/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUserProfile(response.data);
        }
      } catch (error) {
        console.log('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
    fetchChatHistory();

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/chatbot/history');
      const history = res.data.map(item => ({
        from: item.sender,
        text: item.message,
        timestamp: new Date().toISOString(),
      }));
      setMessages(history);
      
      // Animate the content in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start();
    } catch (e) {
      console.log('Failed to load chat history', e);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (customText = null) => {
    const messageToSend = customText || input;
    if (!messageToSend.trim()) return;

    const userMessage = { 
      from: 'user', 
      text: messageToSend,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Auto scroll to bottom
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    // Show typing indicator
    const typingMessage = { from: 'bot', isTyping: true };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const res = await axios.post('/chatbot', { message: messageToSend });
      
      // Update user message status to sent
      setMessages(prev => 
        prev.map(msg => 
          msg === userMessage ? { ...msg, status: 'sent' } : msg
        )
      );
      
      // Remove typing indicator
      setMessages(prev => prev.filter(msg => !msg.isTyping));
      
      const botMessage = {
        from: 'bot',
        text: res.data.reply,
        suggestions: res.data.suggestions || [],
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, botMessage]);
      setSuggestions(botMessage.suggestions || []);

      // Handle navigation
      switch (res.data.action) {
        case 'go_to_schedule_booking':
          navigation.navigate('TripSearch');
          break;
        case 'go_to_instant_booking':
          navigation.navigate('InstantBooking');
          break;
        case 'go_to_my_bookings':
          navigation.navigate('MyBookings');
          break;
      }

    } catch (error) {
      // Remove typing indicator and add error message
      setMessages(prev => prev.filter(msg => !msg.isTyping));
      setMessages(prev => [...prev, { 
        from: 'bot', 
        text: 'Connection error. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true
      }]);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageItem = ({ item, index }) => {
    const isFirstInGroup = index === 0 || messages[index - 1].from !== item.from;
    const isLastInGroup = index === messages.length - 1 || messages[index + 1].from !== item.from;
    
    if (item.isTyping) {
      return (
        <View style={[styles.message, styles.botMessage, styles.typingContainer]}>
          <View style={styles.botAvatarContainer}>
            <View style={styles.botAvatar}>
              <Icon name="chatbubbles" size={14} color="#fff" />
            </View>
          </View>
          <View style={styles.typingBubble}>
            <View style={styles.typingIndicator}>
              <View style={[styles.typingDot, { animationDelay: '0s' }]} />
              <View style={[styles.typingDot, { animationDelay: '0.2s' }]} />
              <View style={[styles.typingDot, { animationDelay: '0.4s' }]} />
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={[
        styles.messageRow,
        item.from === 'user' ? styles.userMessageRow : styles.botMessageRow,
        !isFirstInGroup && (item.from === 'user' ? styles.userMessageGrouped : styles.botMessageGrouped)
      ]}>
        {item.from === 'bot' && isFirstInGroup && (
          <View style={styles.botAvatarContainer}>
            <View style={styles.botAvatar}>
              <Icon name="chatbubbles" size={14} color="#fff" />
            </View>
          </View>
        )}
        
        {item.from === 'bot' && !isFirstInGroup && <View style={styles.botAvatarPlaceholder} />}
        
        <View style={[
          styles.messageBubble,
          item.from === 'user' ? styles.userBubble : styles.botBubble,
          item.isError && styles.errorBubble,
          isFirstInGroup && (item.from === 'user' ? styles.userFirstBubble : styles.botFirstBubble),
          isLastInGroup && (item.from === 'user' ? styles.userLastBubble : styles.botLastBubble),
        ]}>
          <Text style={[
            styles.messageText,
            item.from === 'user' ? styles.userMessageText : styles.botMessageText,
            item.isError && styles.errorText
          ]}>
            {item.text}
          </Text>
          
          {isLastInGroup && (
            <View style={styles.messageFooter}>
              <Text style={[
                styles.messageTime,
                item.from === 'user' ? styles.userMessageTime : styles.botMessageTime
              ]}>
                {formatTime(item.timestamp)}
              </Text>
              {item.from === 'user' && (
                <View style={styles.messageStatus}>
                  {item.status === 'sending' ? (
                    <Icon name="time-outline" size={12} color="rgba(255,255,255,0.6)" />
                  ) : (
                    <Icon name="checkmark-done" size={12} color="rgba(255,255,255,0.6)" />
                  )}
                </View>
              )}
            </View>
          )}
        </View>
        
        {item.from === 'user' && isFirstInGroup && (
            <View style={styles.userAvatarContainer}>
                {userProfile?.profile_photo_url ? (
                <Image 
                    source={{ uri: userProfile.profile_photo_url }} 
                    style={styles.userAvatarImage} 
                />
                ) : (
                <View style={styles.userAvatar}>
                    <Icon name="person" size={14} color="#fff" />
                </View>
                )}
            </View>
            )}

        
        {item.from === 'user' && !isFirstInGroup && <View style={styles.userAvatarPlaceholder} />}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={20} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Chat Assistant</Text>
          <Text style={styles.headerSubtitle}>Online</Text>
        </View>
        
        <TouchableOpacity style={styles.headerButton}>
          <Icon name="ellipsis-vertical" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BRAND_COLOR} />
            <Text style={styles.loadingText}>Loading conversation...</Text>
          </View>
        ) : (
          <Animated.View 
            style={[
              styles.chatContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(_, index) => index.toString()}
              renderItem={renderMessageItem}
              contentContainerStyle={styles.messageList}
              onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => listRef.current?.scrollToEnd({ animated: true })}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconContainer}>
                    <Icon name="chatbubbles" size={40} color="#fff" />
                  </View>
                  <Text style={styles.emptyTitle}>No messages yet</Text>
                  <Text style={styles.emptySubtitle}>Start a conversation with our assistant</Text>
                </View>
              }
            />
          </Animated.View>
        )}

        {suggestions.length > 0 && (
          <View style={styles.suggestionContainer}>
            <FlatList
              horizontal
              data={suggestions}
              keyExtractor={(_, index) => index.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionButton}
                  onPress={() => sendMessage(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suggestionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        <View style={[
          styles.inputContainer,
          Platform.OS === 'ios' && keyboardVisible && styles.inputContainerWithKeyboard
        ]}>
          <View style={styles.inputWrapper}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Type your message..."
              placeholderTextColor="#999"
              style={styles.input}
              multiline
              maxLength={500}
            />
            <TouchableOpacity style={styles.attachButton}>
              <Icon name="attach" size={22} color="#888" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            onPress={() => sendMessage()} 
            style={[
              styles.sendButton,
              !input.trim() && styles.sendButtonDisabled
            ]}
            disabled={!input.trim()}
            activeOpacity={0.7}
          >
            <Icon name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  chatContainer: {
    flex: 1,
  },
  messageList: {
    padding: 16,
    paddingBottom: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 2,
    alignItems: 'flex-end',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  botMessageRow: {
    justifyContent: 'flex-start',
  },
  userMessageGrouped: {
    marginTop: 2,
  },
  botMessageGrouped: {
    marginTop: 2,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: '70%',
  },
  userBubble: {
    backgroundColor: BRAND_COLOR,
    borderBottomRightRadius: 4,
    marginLeft: 40,
  },
  botBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    marginRight: 40,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  userFirstBubble: {
    borderTopRightRadius: 18,
  },
  userLastBubble: {
    borderBottomRightRadius: 18,
    marginBottom: 8,
  },
  botFirstBubble: {
    borderTopLeftRadius: 18,
  },
  botLastBubble: {
    borderBottomLeftRadius: 18,
    marginBottom: 8,
  },
  errorBubble: {
    backgroundColor: '#ffebee',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#333',
  },
  errorText: {
    color: '#d32f2f',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
  },
  userMessageTime: {
    color: 'rgba(255,255,255,0.6)',
  },
  botMessageTime: {
    color: 'rgba(0,0,0,0.4)',
  },
  messageStatus: {
    marginLeft: 4,
  },
  userAvatarContainer: {
    width: 28,
    height: 28,
    marginLeft: 8,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#888',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  userAvatarPlaceholder: {
    width: 36,
  },
  botAvatarContainer: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BRAND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botAvatarPlaceholder: {
    width: 36,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  typingBubble: {
    backgroundColor: '#f0f0f0',
    borderRadius: 18,
    padding: 12,
    paddingHorizontal: 16,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 16,
    width: 40,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#888',
    marginHorizontal: 3,
    opacity: 0.6,
  },
  suggestionContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 12,
  },
  suggestionList: {
    paddingHorizontal: 16,
  },
  suggestionButton: {
    backgroundColor: `${BRAND_COLOR}10`,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: `${BRAND_COLOR}30`,
  },
  suggestionText: {
    color: BRAND_COLOR,
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'flex-end',
  },
  inputContainerWithKeyboard: {
    borderBottomWidth: 0,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 4,
    alignItems: 'flex-end',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingTop: Platform.OS === 'ios' ? 0 : 8,
    paddingBottom: Platform.OS === 'ios' ? 0 : 8,
    color: '#333',
  },
  attachButton: {
    paddingHorizontal: 4,
    paddingBottom: Platform.OS === 'ios' ? 0 : 8,
  },
  sendButton: {
    backgroundColor: BRAND_COLOR,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
    shadowColor: '#999',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: BRAND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    maxWidth: '80%',
  },
});

export default CustomChat;