import Toast from 'react-native-toast-message';

export const showToast = ({ type = 'success', text1, text2 }) => {
  Toast.show({
    type,
    text1,
    text2,
    position: 'top',
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 60,
  });
};

export const ToastContainer = () => <Toast />; 
