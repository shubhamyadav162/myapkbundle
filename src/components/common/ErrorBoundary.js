import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isRecovering: false
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('App crashed with error:', error);
    console.error('Component stack:', errorInfo.componentStack);
    this.setState({ errorInfo });
  }

  resetError = () => {
    this.setState({ isRecovering: true });
    
    // Allow UI to update to show recovery attempt before actually recovering
    setTimeout(() => {
      this.setState({ 
        hasError: false, 
        error: null, 
        errorInfo: null,
        isRecovering: false 
      });
    }, 500);
  }

  render() {
    if (this.state.hasError) {
      // Check if error is related to assets loading
      const isAssetError = this.state.error?.message?.includes('asset') || 
                         this.state.error?.message?.includes('resource');
      
      const errorMessage = isAssetError 
        ? "Failed to load app resources. This might be due to a connection issue or corrupted app cache."
        : this.state.error?.toString();
        
      const recoveryHelp = isAssetError 
        ? "Try closing the app completely and reopening it, or check your internet connection."
        : "";

      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Something went wrong!</Text>
            
            {this.state.isRecovering ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF3B30" />
                <Text style={styles.loadingText}>Attempting to recover...</Text>
              </View>
            ) : (
              <>
                <ScrollView style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                  
                  {recoveryHelp ? (
                    <Text style={styles.helpText}>{recoveryHelp}</Text>
                  ) : null}
                  
                  {!isAssetError && (
                    <Text style={styles.stackText}>
                      {this.state.errorInfo?.componentStack || 'No stack trace available'}
                    </Text>
                  )}
                </ScrollView>
                
                <TouchableOpacity 
                  style={styles.button}
                  onPress={this.resetError}
                >
                  <Text style={styles.buttonText}>Try Again</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 20,
  },
  errorContainer: {
    maxHeight: 400,
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#111',
    padding: 15,
    borderRadius: 8,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    marginBottom: 10,
  },
  helpText: {
    color: '#FFCC80',
    fontSize: 14,
    marginBottom: 15,
  },
  stackText: {
    color: '#BBBBBB',
    fontSize: 12,
  },
  button: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 20,
    fontSize: 16,
  },
});

export default ErrorBoundary; 
