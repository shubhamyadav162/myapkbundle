import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

const AdminDashboardScreen = () => {
  const navigation = useNavigation();
  useEffect(() => {
    navigation.replace('Dashboard');
  }, [navigation]);
  return null;
};

export default AdminDashboardScreen; 
