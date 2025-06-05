import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert, View, ActivityIndicator } from 'react-native';
import { Input, Button, Text, Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import baseTheme from '../../theme';
import { useTheme, ThemeProvider } from '../../components/common/ThemeProvider';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

const NotificationAddScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('');
  const [type, setType] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [audienceOptions] = useState(['All Users', 'Subscribed Users', 'New Users', 'Region-Based']);
  const [typeOptions] = useState(['Push', 'Email', 'In-App']);
  const [sending, setSending] = useState(false);

  const handleSave = async () => {
    if (!title || !message) {
      Alert.alert('Validation error', 'Title and message are required');
      return;
    }
    setSending(true);
    try {
      await axios.post('https://your-backend.com/api/notifications', { title, message, audience, type, scheduleDate });
      Alert.alert('Success', 'Notification sent successfully');
      navigation.navigate('Notifications');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Button
        type="clear"
        icon={<Icon name="arrow-left" type="feather" color={theme.colors.text} />}
        onPress={() => navigation.goBack()}
        containerStyle={{ alignSelf: 'flex-start', marginBottom: baseTheme.spacing.medium }}
      />
      <Text h4 style={[styles.header, { color: theme.colors.primary }]}>Create New Notification</Text>
      <Input
        placeholder="Title"
        placeholderTextColor={theme.colors.textSecondary}
        inputStyle={{ color: theme.colors.text }}
        inputContainerStyle={{ borderBottomColor: theme.colors.border }}
        leftIcon={{ type: 'feather', name: 'bell', color: theme.colors.primary }}
        value={title}
        onChangeText={setTitle}
      />
      <Input
        placeholder="Message"
        placeholderTextColor={theme.colors.textSecondary}
        inputStyle={{ color: theme.colors.text }}
        inputContainerStyle={{ borderBottomColor: theme.colors.border }}
        leftIcon={{ type: 'feather', name: 'message-circle', color: theme.colors.primary }}
        value={message}
        onChangeText={setMessage}
        multiline
      />
      <Text style={[styles.label, { color: theme.colors.text }]}>Audience</Text>
      <View style={[styles.pickerContainer, { backgroundColor: theme.colors.backgroundLight, borderColor: theme.colors.border }]}>
        <Picker
          selectedValue={audience}
          onValueChange={setAudience}
          style={[styles.picker, { color: theme.colors.text, backgroundColor: theme.colors.backgroundLight }]}
          dropdownIconColor={theme.colors.primary}
          itemStyle={{ color: theme.colors.text, backgroundColor: theme.colors.backgroundLight }}
        >
          <Picker.Item label="Select Audience" value="" color={theme.colors.textSecondary} />
          {audienceOptions.map(opt => (
            <Picker.Item label={opt} value={opt} key={opt} color={theme.colors.text} />
          ))}
        </Picker>
      </View>
      
      <Text style={[styles.label, { color: theme.colors.text }]}>Type</Text>
      <View style={[styles.pickerContainer, { backgroundColor: theme.colors.backgroundLight, borderColor: theme.colors.border }]}>
        <Picker
          selectedValue={type}
          onValueChange={setType}
          style={[styles.picker, { color: theme.colors.text, backgroundColor: theme.colors.backgroundLight }]}
          dropdownIconColor={theme.colors.primary}
          itemStyle={{ color: theme.colors.text, backgroundColor: theme.colors.backgroundLight }}
        >
          <Picker.Item label="Select Type" value="" color={theme.colors.textSecondary} />
          {typeOptions.map(opt => (
            <Picker.Item label={opt} value={opt} key={opt} color={theme.colors.text} />
          ))}
        </Picker>
      </View>
      
      <Text style={[styles.label, { color: theme.colors.text }]}>Schedule Date</Text>
      <Input
        placeholder="Schedule Date (YYYY-MM-DD HH:mm)"
        placeholderTextColor={theme.colors.textSecondary}
        inputStyle={{ color: theme.colors.text }}
        inputContainerStyle={{ borderBottomColor: theme.colors.border }}
        value={scheduleDate}
        onChangeText={setScheduleDate}
        leftIcon={{ type: 'feather', name: 'calendar', color: theme.colors.primary }}
      />
      
      <Text style={[styles.previewHeader, { color: theme.colors.primary }]}>Preview</Text>
      <View style={[styles.previewBox, { backgroundColor: theme.colors.backgroundLight, borderColor: theme.colors.border }]}>
        <Text style={[styles.previewTitle, { color: theme.colors.text }]}>
          {title || 'Title Preview'}
        </Text>
        <Text style={[styles.previewMessage, { color: theme.colors.textSecondary }]}>
          {message || 'Message Preview'}
        </Text>
      </View>
      
      {sending ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      ) : (
        <Button
          title="Save Notification"
          onPress={handleSave}
          containerStyle={styles.button}
          buttonStyle={{ backgroundColor: theme.colors.primary }}
          titleStyle={{ color: '#FFFFFF', fontWeight: 'bold' }}
          icon={<Icon name="save" type="feather" color="#FFFFFF" size={18} style={{ marginRight: 8 }} />}
          raised
          disabled={!title || !message}
          disabledStyle={{ backgroundColor: theme.colors.inactive }}
          disabledTitleStyle={{ color: '#DDDDDD' }}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: baseTheme.spacing.large,
    minHeight: '100%',
  },
  header: { 
    alignSelf: 'center', 
    marginBottom: baseTheme.spacing.large,
    fontSize: 26,
  },
  button: { 
    marginTop: baseTheme.spacing.large,
    borderRadius: baseTheme.borderRadius.medium,
    overflow: 'hidden',
  },
  label: { 
    marginTop: baseTheme.spacing.medium, 
    marginBottom: baseTheme.spacing.small,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: baseTheme.borderRadius.medium,
    marginBottom: baseTheme.spacing.medium,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  previewHeader: { 
    marginTop: baseTheme.spacing.large, 
    fontSize: 18, 
    fontWeight: '600',
    marginBottom: baseTheme.spacing.small,
    marginLeft: 10,
  },
  previewBox: { 
    marginTop: baseTheme.spacing.small, 
    padding: baseTheme.spacing.medium, 
    borderRadius: baseTheme.borderRadius.medium,
    borderWidth: 1,
    elevation: 2,
  },
  previewTitle: { 
    fontSize: 18, 
    fontWeight: 'bold',
    marginBottom: baseTheme.spacing.small,
  },
  previewMessage: { 
    fontSize: 14, 
    marginTop: baseTheme.spacing.small,
    lineHeight: 20,
  },
  loader: { 
    marginTop: baseTheme.spacing.large,
    marginBottom: baseTheme.spacing.medium,
  },
});

const NotificationAddScreenWithTheme = (props) => (
  <ThemeProvider>
    <NotificationAddScreen {...props} />
  </ThemeProvider>
);

export default NotificationAddScreenWithTheme; 
