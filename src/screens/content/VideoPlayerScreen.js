/* eslint-disable react/jsx-no-duplicate-props */
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  StatusBar,
  Platform,
  PanResponder,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { Video } from 'expo-av';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Brightness from 'expo-brightness';
import Slider from '@react-native-community/slider';
import * as NavigationBar from 'expo-navigation-bar';

// Import API services
import contentApi from '../../api/contentApi.js';
import analyticsApi from '../../api/analyticsApi.js';

// Import theme
import theme from '../../theme';

const VideoPlayerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { contentId, episodeId, title, continueWatching, source } = route.params || {};
  
  // use dynamic dimensions for proper overlay positioning
  const { width, height } = useWindowDimensions();
  
  // Video player state
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isBuffering, setIsBuffering] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoTitle, setVideoTitle] = useState(title || '');
  const [videoError, setVideoError] = useState(null);
  
  // Control the visibility of controls with timeout
  const controlsTimeoutRef = useRef(null);
  
  // Brightness and volume adjustment state and refs
  const [internalBrightness, setInternalBrightness] = useState(1);
  const [internalVolume, setInternalVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [muted, setMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [showBrightnessOverlay, setShowBrightnessOverlay] = useState(false);
  const [showVolumeOverlay, setShowVolumeOverlay] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(true);
  
  useEffect(() => {
    StatusBar.setHidden(isFullScreen, 'fade');
    if (Platform.OS === 'android') {
      // navigation bar को काली रंग में सेट करें और immersive मोड में छिपाएं/दिखाएं
      NavigationBar.setBackgroundColorAsync('#000000');
      NavigationBar.setBehaviorAsync('immersive');
      NavigationBar.setVisibilityAsync(isFullScreen ? 'hidden' : 'visible');
    }
  }, [isFullScreen]);
  
  const overlayTimeoutRef = useRef(null);
  const startBrightnessRef = useRef(internalBrightness);
  const startVolumeRef = useRef(internalVolume);
  
  // Overlay height for brightness/volume
  const OVERLAY_HEIGHT = 200;
  
  // Aspect ratio control state
  const [resizeModeState, setResizeModeState] = useState('contain');
  const [showAspectOverlay, setShowAspectOverlay] = useState(false);
  const aspectTimeoutRef = useRef(null);
  const aspectModeNames = {
    cover: 'Fill',
    contain: 'Best Fit',
    stretch: 'Stretch',
  };
  const cycleAspect = () => {
    let next;
    if (resizeModeState === 'cover') next = 'contain';
    else if (resizeModeState === 'contain') next = 'stretch';
    else next = 'cover';
    setResizeModeState(next);
    setShowAspectOverlay(true);
    if (aspectTimeoutRef.current) clearTimeout(aspectTimeoutRef.current);
    aspectTimeoutRef.current = setTimeout(() => setShowAspectOverlay(false), 1000);
  };
  
  // Gesture handler for taps (to toggle controls) and vertical swipes (brightness/volume)
  const panResponder = PanResponder.create({
    // Don't capture start taps; detect only vertical swipes when controls are hidden
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_evt, gestureState) => {
      const { dx, dy } = gestureState;
      return !showControls && Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx);
    },
    onPanResponderGrant: (evt, gestureState) => {
      // Record start positions and brightness/volume
      startXRef.current = gestureState.x0;
      startYRef.current = gestureState.y0;
      startBrightnessRef.current = internalBrightness;
      startVolumeRef.current = internalVolume;
    },
    onPanResponderMove: (evt, gestureState) => {
      const { dx, dy } = gestureState;
      // Only consider vertical movement beyond small threshold
      if (Math.abs(dy) < 10 || Math.abs(dy) < Math.abs(dx)) return;
      // Show overlay for brightness or volume
      if (startXRef.current < width / 2) {
        setShowBrightnessOverlay(true);
        setShowVolumeOverlay(false);
      } else {
        setShowVolumeOverlay(true);
        setShowBrightnessOverlay(false);
      }
      if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
      const change = -dy / height;
      if (startXRef.current < width / 2) {
        let newBrightness = startBrightnessRef.current + change;
        newBrightness = Math.max(0, Math.min(1, newBrightness));
        setInternalBrightness(newBrightness);
        Brightness.setBrightnessAsync(newBrightness).catch(() => {});
      } else {
        let newVolume = startVolumeRef.current + change;
        newVolume = Math.max(0, Math.min(1, newVolume));
        setInternalVolume(newVolume);
        if (videoRef.current) videoRef.current.setVolumeAsync(newVolume);
      }
    },
    onPanResponderRelease: () => {
      // Hide any overlays after delay
      overlayTimeoutRef.current = setTimeout(() => {
        setShowBrightnessOverlay(false);
        setShowVolumeOverlay(false);
      }, 1000);
    },
    onPanResponderTerminationRequest: () => false,
  });
  
  // Load video details
  useEffect(() => {
    const loadVideoDetails = async () => {
      try {
        let response;
        
        // If episode ID is provided, fetch episode details
        if (episodeId) {
          response = await contentApi.getEpisodeDetails(contentId, episodeId);
          if (response.success) {
            setVideoUrl(response.data.video_url);
            setVideoTitle(response.data.title);
            analyticsApi.logEvent('video_view', { userId: null, contentId: contentId, secondsWatched: 0 });
          }
        } 
        // Otherwise, fetch content details
        else {
          response = await contentApi.getContentDetails(contentId);
          if (response.success) {
            setVideoUrl(response.data.video_url);
            setVideoTitle(response.data.title);
            analyticsApi.logEvent('video_view', { userId: null, contentId: contentId, secondsWatched: 0 });
          }
        }
        
        if (!response.success) {
          setVideoError('Failed to load video. Please try again.');
        }
      } catch (error) {
        console.error('Error loading video:', error);
        setVideoError('Failed to load video. Please try again.');
      }
    };
    
    // If a source param is provided, use it directly
    if (source) {
      setVideoUrl(source);
      setVideoTitle(title || '');
      setIsBuffering(false);
      analyticsApi.logEvent('video_view', { userId: null, contentId: contentId, secondsWatched: 0 });
    } else {
      loadVideoDetails();
    }
    
    // Lock screen to landscape
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    };
    lockOrientation();
    
    // Request brightness permission and set initial brightness
    (async () => {
      const { status } = await Brightness.requestPermissionsAsync();
      if (status === 'granted') {
        const current = await Brightness.getBrightnessAsync();
        setInternalBrightness(current);
        startBrightnessRef.current = current;
      }
    })();
    
    // Handle continue watching position
    if (continueWatching && continueWatching.position) {
      setCurrentTime(continueWatching.position);
    }
    
    // Clean up on unmount
    return () => {
      // Return to portrait orientation
      const unlockOrientation = async () => {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      };
      unlockOrientation();
      
      // Clear any timeouts
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      // Clear aspect ratio overlay timeout
      if (aspectTimeoutRef.current) {
        clearTimeout(aspectTimeoutRef.current);
      }
    };
  }, [contentId, episodeId, continueWatching, source, title]);
  
  // Handle press on video to show/hide controls
  const handleVideoPress = () => {
    if (isLocked) return;
    const willShow = !showControls;
    setShowControls(willShow);
    // Clear any existing hide timeout
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    // Auto-hide controls after 5 seconds only when showing and video is playing
    if (willShow && isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 5000);
    }
  };
  
  // Handle play/pause
  const togglePlayPause = async () => {
    if (isPlaying) {
      analyticsApi.logEvent('watch_time', { userId: null, contentId: contentId, secondsWatched: currentTime });
    }
    const newPlaying = !isPlaying;
    setIsPlaying(newPlaying);
    // Imperatively play or pause the video
    if (videoRef.current) {
      if (newPlaying) {
        await videoRef.current.playAsync();
      } else {
        await videoRef.current.pauseAsync();
      }
    }
    // Ensure controls are visible when toggling play/pause
    setShowControls(true);
    // Clear any existing hide timeout
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    // If playing, auto-hide controls after 5 seconds
    if (newPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 5000);
    }
  };
  
  // New functions: rewind 10s, fast-forward 10s, mute toggle, speed toggle
  const handleRewind = async () => {
    if (videoRef.current) {
      const newTime = Math.max(0, currentTime - 10);
      await videoRef.current.setPositionAsync(newTime * 1000);
      setCurrentTime(newTime);
    }
  };
  const handleFastForward = async () => {
    if (videoRef.current) {
      const newTime = Math.min(duration, currentTime + 10);
      await videoRef.current.setPositionAsync(newTime * 1000);
      setCurrentTime(newTime);
    }
  };
  const toggleMute = async () => {
    const newMuted = !muted;
    setMuted(newMuted);
    if (videoRef.current) {
      await videoRef.current.setIsMutedAsync(newMuted);
    }
  };
  const toggleSpeed = async () => {
    const rates = [0.5, 1, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const newRate = rates[nextIndex];
    setPlaybackRate(newRate);
    if (videoRef.current) {
      await videoRef.current.setRateAsync(newRate, true);
    }
  };
  
  // Handle seek
  const handleSeek = async (value) => {
    // maintain paused state after seeking
    const wasPlaying = isPlaying;
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(value * 1000);
      if (!wasPlaying) {
        await videoRef.current.pauseAsync();
      }
    }
    setCurrentTime(value);
  };
  
  // Handle video load
  const handleLoad = async (status) => {
    if (status.isLoaded) {
      // वीडियो लोड होते ही full brightness और full volume सेट करें
      Brightness.setBrightnessAsync(1).catch(() => {});
      setInternalBrightness(1);
      if (videoRef.current) {
        await videoRef.current.setVolumeAsync(1);
        await videoRef.current.setIsMutedAsync(false);
      }
      setInternalVolume(1);
      setMuted(false);
      
      setDuration(status.durationMillis / 1000);
      setIsBuffering(false);
      // Resume from continue-watching position
      if (continueWatching && continueWatching.position) {
        await videoRef.current.setPositionAsync(continueWatching.position * 1000);
      }
      // Imperatively start or pause playback
      if (videoRef.current) {
        if (isPlaying) {
          await videoRef.current.playAsync();
        } else {
          await videoRef.current.pauseAsync();
        }
      }
    } else if (status.error) {
      console.error('Video loading error:', status.error);
      setVideoError(`Failed to load video: ${status.error}`);
    }
  };
  
  // Handle playback status update
  const handlePlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setCurrentTime(status.positionMillis / 1000);
      setIsBuffering(status.isBuffering);
      
      // Handle video end
      if (status.didJustFinish && !status.isLooping) {
        analyticsApi.logEvent('video_complete', { userId: null, contentId: contentId, secondsWatched: Math.floor(status.durationMillis / 1000) });
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      }
    }
  };
  
  // Handle back
  const handleBack = () => {
    navigation.goBack();
  };
  
  // Format time for display (converts seconds to MM:SS format)
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // New functions: loop toggle and Picture-in-Picture
  const toggleLoop = async () => {
    const newLoop = !isLooping;
    setIsLooping(newLoop);
    if (videoRef.current) {
      await videoRef.current.setIsLoopingAsync(newLoop);
    }
  };
  const handlePictureInPicture = async () => {
    if (videoRef.current && videoRef.current.presentPictureInPictureAsync) {
      await videoRef.current.presentPictureInPictureAsync();
    }
  };
  
  // Handle screen lock/unlock
  const toggleLock = () => {
    setIsLocked(prevLocked => {
      const newLocked = !prevLocked;
      setShowControls(!newLocked);
      return newLocked;
    });
  };
  
  // Handle casting action (placeholder)
  const handleCast = () => {
    // TODO: integrate casting functionality
    console.log('Cast button pressed');
  };
  
  // Toggle full screen orientation
  const toggleFullScreen = async () => {
    if (isFullScreen) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    }
    setIsFullScreen(!isFullScreen);
  };
  
  // Show error state
  if (videoError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{videoError}</Text>
        <TouchableOpacity style={styles.errorButton} onPress={handleBack}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Show loading state if no video URL yet
  if (!videoUrl) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar hidden={isFullScreen} backgroundColor="#000000" barStyle="light-content" translucent={false} />
      
      {/* Video Player */}
      <View style={styles.videoContainer} {...(!showBrightnessOverlay && !showVolumeOverlay ? panResponder.panHandlers : {})}>
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={styles.video}
          resizeMode={resizeModeState}
          rate={playbackRate}
          isMuted={muted}
          isLooping={isLooping}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          onLoad={handleLoad}
          onError={(errorEvent) => {
            console.error('Video playback error:', errorEvent);
            setVideoError('Failed to load video. Please try again.');
          }}
          volume={internalVolume}
        />
        {/* Brightness dim overlay */}
        <View style={[styles.brightnessOverlay, { opacity: 1 - internalBrightness }]} pointerEvents="none" />
        {/* Custom brightness and volume indicators */}
        {showBrightnessOverlay && (
          <View style={[
            styles.customOverlay,
            { left: 20, top: '50%', marginTop: -OVERLAY_HEIGHT/2, height: OVERLAY_HEIGHT, width: 60 }
          ]}>
            <Icon name="brightness-medium" size={30} color="#FFF" />
            <Slider
              style={styles.verticalSlider}
              value={internalBrightness}
              step={0.01}
              minimumValue={0}
              maximumValue={1}
              onValueChange={(value) => {
                setInternalBrightness(value);
                Brightness.setBrightnessAsync(value).catch(() => {});
              }}
              onSlidingComplete={(value) => {
                let finalVal = value < 0.02 ? 0 : value > 0.98 ? 1 : parseFloat(value.toFixed(2));
                setInternalBrightness(finalVal);
                Brightness.setBrightnessAsync(finalVal).catch(() => {});
                // Hide brightness overlay after delay
                if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
                overlayTimeoutRef.current = setTimeout(() => {
                  setShowBrightnessOverlay(false);
                }, 1000);
              }}
              minimumTrackTintColor="#FFF"
              maximumTrackTintColor="rgba(255,255,255,0.3)"
              thumbTintColor="#FFF"
            />
          </View>
        )}
        {showVolumeOverlay && (
          <View style={[
            styles.customOverlay,
            { right: 20, top: '50%', marginTop: -OVERLAY_HEIGHT/2, height: OVERLAY_HEIGHT, width: 60 }
          ]}>
            <Icon name={internalVolume === 0 ? 'volume-off' : internalVolume < 0.5 ? 'volume-down' : 'volume-up'} size={30} color="#FFF" />
            <Slider
              style={styles.verticalSlider}
              value={internalVolume}
              step={0.01}
              minimumValue={0}
              maximumValue={1}
              onValueChange={(value) => {
                setInternalVolume(value);
                if (videoRef.current) {
                  videoRef.current.setVolumeAsync(value);
                }
              }}
              onSlidingComplete={(value) => {
                let finalVal = value < 0.02 ? 0 : value > 0.98 ? 1 : parseFloat(value.toFixed(2));
                setInternalVolume(finalVal);
                if (videoRef.current) {
                  videoRef.current.setVolumeAsync(finalVal);
                }
                // Hide volume overlay after delay
                if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
                overlayTimeoutRef.current = setTimeout(() => {
                  setShowVolumeOverlay(false);
                }, 1000);
              }}
              minimumTrackTintColor="#FFF"
              maximumTrackTintColor="rgba(255,255,255,0.3)"
              thumbTintColor="#FFF"
            />
          </View>
        )}
        {/* Aspect ratio overlay */}
        {showAspectOverlay && (
          <View style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', alignItems: 'center' }]} pointerEvents="none">
            <View style={{ backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
              <Text style={{ color: '#FFF', fontSize: 16 }}>{aspectModeNames[resizeModeState]}</Text>
            </View>
          </View>
        )}
        {/* Buffering Indicator */}
        {isBuffering && (
          <View style={styles.bufferingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}
        {isLocked && (
          <View style={styles.unlockContainer}>
            <TouchableOpacity onPress={toggleLock}>
              <Icon name="lock-open" size={30} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
        {/* Transparent touch layer for taps when controls are hidden (skip when slider overlays are active) */}
        {!showControls && !showBrightnessOverlay && !showVolumeOverlay && (
          <Pressable style={StyleSheet.absoluteFill} onPress={handleVideoPress} />
        )}
        
        {/* Video Controls */}
        {showControls && (
          <TouchableWithoutFeedback onPress={handleVideoPress}>
            <View style={styles.controlsContainer}>
              {/* Top Bar with Title and Back Button */}
              <View style={styles.topBar}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                  <Icon name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.videoTitle} numberOfLines={1}>
                  {videoTitle}
                </Text>
                <View style={styles.topIconsContainer}>
                  <TouchableOpacity
                    style={styles.castButton}
                    onPress={() => {
                      setShowBrightnessOverlay(true);
                      setShowVolumeOverlay(false);
                      if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
                      overlayTimeoutRef.current = setTimeout(() => {
                        setShowBrightnessOverlay(false);
                      }, 1000);
                    }}
                  >
                    <Icon name="brightness-medium" size={24} color="#FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.castButton}
                    onPress={() => {
                      setShowVolumeOverlay(true);
                      setShowBrightnessOverlay(false);
                      if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
                      overlayTimeoutRef.current = setTimeout(() => {
                        setShowVolumeOverlay(false);
                      }, 1000);
                    }}
                  >
                    <Icon
                      name={
                        internalVolume === 0
                          ? 'volume-off'
                          : internalVolume < 0.5
                          ? 'volume-down'
                          : 'volume-up'
                      }
                      size={24}
                      color="#FFF"
                    />
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Center Controls: rewind, play/pause, fast-forward */}
              <View style={styles.centerControls}>
                <TouchableOpacity onPress={handleRewind}>
                  <Icon name="replay-10" size={36} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.playPauseButton}
                  onPress={togglePlayPause}
                >
                  <Icon
                    name={isPlaying ? 'pause' : 'play-arrow'}
                    size={48}
                    color="#FFF"
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleFastForward}>
                  <Icon name="forward-10" size={36} color="#FFF" />
                </TouchableOpacity>
              </View>
              
              {/* Bottom Progress Bar */}
              <View style={styles.bottomBar}>
                <TouchableOpacity onPress={toggleLock} style={styles.bottomButton}>
                  <Icon name={isLocked ? 'lock' : 'lock-open'} size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                <Slider
                  style={styles.progressBar}
                  minimumValue={0}
                  maximumValue={duration}
                  value={currentTime}
                  onValueChange={(value) => setCurrentTime(value)}
                  onSlidingComplete={handleSeek}
                  minimumTrackTintColor={theme.colors.success}
                  maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                  thumbTintColor={theme.colors.success}
                />
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
                <TouchableOpacity onPress={cycleAspect} style={styles.bottomButton}>
                  <Icon name="aspect-ratio" size={24} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleFullScreen} style={styles.bottomButton}>
                  <Icon name={isFullScreen ? 'fullscreen-exit' : 'fullscreen'} size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  customOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    zIndex: 1000,
    elevation: 1000,
  },
  verticalSlider: {
    width: 200,
    height: 40,
    transform: [{ rotate: '-90deg' }],
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  videoTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  topIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  castButton: {
    padding: 8,
  },
  centerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFF',
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  progressBar: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  timeText: {
    color: '#FFF',
    fontSize: 14,
  },
  bufferingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  errorButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  brightnessOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
  bottomButton: {
    padding: 8,
  },
  unlockContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
});

export default VideoPlayerScreen; 
