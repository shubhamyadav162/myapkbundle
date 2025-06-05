import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import { Appbar, Avatar, Badge, IconButton, Searchbar, Menu } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import theme from '../../theme';
import { useNavigation } from '@react-navigation/native';

const HeaderBar = ({ onToggleTheme, isDarkMode, notificationCount, onLogout, onSettings }) => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [menuVisible, setMenuVisible] = React.useState(false);

  return (
    <Appbar.Header style={styles.header}>
      <View style={styles.leftSection}>
        <Text style={styles.logo}>Big Show</Text>
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.search}
            inputStyle={{ color: theme.colors.text }}
            placeholderTextColor={theme.colors.textSecondary}
            icon={() => (
              <MaterialCommunityIcons 
                name="magnify" 
                size={24} 
                color={theme.colors.textSecondary} 
              />
            )}
          />
        </View>
      </View>
      <View style={styles.rightSection}>
        <IconButton
          icon={({ size, color }) => (
            <MaterialCommunityIcons
              name={isDarkMode ? 'weather-sunny' : 'weather-night'}
              size={size}
              color={color}
            />
          )}
          color={theme.colors.text}
          size={24}
          onPress={onToggleTheme}
          style={Platform.OS === 'web' ? { cursor: 'pointer' } : {}}
        />
        <IconButton
          icon={({ size, color }) => (
            <MaterialCommunityIcons
              name="currency-usd"
              size={size}
              color={theme.colors.text}
            />
          )}
          color={theme.colors.text}
          size={24}
          onPress={() => navigation.navigate('Payments')}
          style={Platform.OS === 'web' ? { cursor: 'pointer' } : {}}
        />
        <View style={styles.notificationWrapper}>
          <IconButton
            icon={() => <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />}
            onPress={() => navigation.navigate('Notifications')}
            style={Platform.OS === 'web' ? { cursor: 'pointer' } : {}}
          />
          {notificationCount > 0 && (
            <Badge style={styles.badge}>{notificationCount}</Badge>
          )}
        </View>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableOpacity 
               onPress={() => setMenuVisible(true)}
               style={Platform.OS === 'web' ? { cursor: 'pointer' } : {}}
            >
              <Avatar.Icon 
                size={36} 
                icon={({ size, color }) => (
                  <MaterialCommunityIcons name="account" size={size} color={color} />
                )} 
                style={styles.avatar} 
              />
            </TouchableOpacity>
          }
        >
          <Menu.Item 
            leadingIcon="cog" 
            onPress={onSettings} 
            title="Settings" 
          />
          <Menu.Item 
            leadingIcon="logout" 
            onPress={onLogout} 
            title="Logout" 
          />
        </Menu>
      </View>
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    elevation: 4,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.large,
    height: 64,
    ...(Platform.OS === 'web' && {
      position: 'sticky',
      top: 0,
    }),
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.title,
    fontWeight: theme.typography.fontWeight.bold,
    marginRight: theme.spacing.large,
    textShadowColor: '#222',
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 4,
  },
  searchContainer: {
    flex: 1,
    position: 'relative',
  },
  search: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
    height: 40,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationWrapper: {
    position: 'relative',
    marginHorizontal: 8,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: theme.colors.primary,
    color: '#fff',
    fontSize: 10,
    zIndex: 10,
  },
  avatar: {
    backgroundColor: theme.colors.accent,
    marginLeft: 8,
  },
});

export default HeaderBar; 
