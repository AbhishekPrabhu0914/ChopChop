'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'nova';
  timestamp: Date;
  hasImage?: boolean;
  imageUrl?: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFridgeMode, setIsFridgeMode] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize messages on client side only to avoid hydration mismatch
  useEffect(() => {
    if (!isInitialized) {
      setMessages([
        {
          id: '1',
          text: 'Hey, I\'m ChopChop, your Kitchen Assistant! I can help you with cooking questions, recipe suggestions, and analyze food images. What would you like to cook today?',
          sender: 'nova',
          timestamp: new Date()
        }
      ]);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 100MB)
      if (file.size > 100 * 1024 * 1024) {
        alert('Image too large. Maximum supported size is 100MB. Please compress or resize your image.');
        return;
      }
      
      // Check file format
      const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!supportedFormats.includes(file.type.toLowerCase())) {
        alert('Unsupported image format. Please use JPEG, PNG, GIF, or WebP images.');
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFridgePhoto = async (file: File) => {
    console.log('Starting fridge photo upload:', file.name, file.type, file.size);
    
    // Check file size (limit to 100MB)
    if (file.size > 100 * 1024 * 1024) {
      alert('Image too large. Maximum supported size is 100MB. Please compress or resize your image.');
      return;
    }
    
    // Check file format
    const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!supportedFormats.includes(file.type.toLowerCase())) {
      alert('Unsupported image format. Please use JPEG, PNG, GIF, or WebP images.');
      return;
    }
    
    setIsFridgeMode(true);
    setSelectedImage(file);
    
    // Create image preview for user message and set in state
    const imagePreviewUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    console.log('Image preview created, length:', imagePreviewUrl.length);
    // Set the image preview in state
    setImagePreview(imagePreviewUrl);

    // Add user message showing the uploaded fridge photo
    const userMessage: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: "📸 Uploaded fridge photo - analyzing ingredients and generating recipes...",
      sender: 'user',
      timestamp: new Date(),
      hasImage: true,
      imageUrl: imagePreviewUrl
    };
    setMessages(prev => [...prev, userMessage]);

    setIsLoading(true);

    try {
      const imageBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(file);
      });

      console.log('Sending request to backend with imageBase64 length:', imageBase64.length);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: "Analyze this fridge photo and suggest recipes based on the ingredients you can see. List the ingredients first, then provide 2-3 recipe suggestions with cooking instructions.",
          imageBase64,
          imageFormat: file.type.split('/')[1]
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const novaMessage: Message = {
          id: `nova-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          text: data.response,
          sender: 'nova',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, novaMessage]);
      } else {
        console.error('Backend error:', data);
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error analyzing fridge photo:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: 'Sorry, I encountered an error analyzing your fridge photo. Please try again.',
        sender: 'nova',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsFridgeMode(false);
      removeImage();
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() && !selectedImage) return;

    const userMessage: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      hasImage: !!selectedImage,
      imageUrl: imagePreview || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let imageBase64 = null;
      let imageFormat = null;

      if (selectedImage) {
        imageBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Remove data:image/jpeg;base64, prefix
            resolve(result.split(',')[1]);
          };
          reader.readAsDataURL(selectedImage);
        });
        imageFormat = selectedImage.type.split('/')[1];
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          imageBase64,
          imageFormat
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const novaMessage: Message = {
          id: `nova-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          text: data.response,
          sender: 'nova',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, novaMessage]);
      } else {
        console.error('Backend error:', data);
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'nova',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      removeImage();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🚀 ChopChop Chat
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>Powered by Amazon Bedrock</p>
          </div>
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  uploadFridgePhoto(file);
                }
              };
              input.click();
            }}
            disabled={isLoading}
            style={{
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isLoading ? '⏳' : '📸'} Upload Fridge Photo
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{ display: 'flex', justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start' }}
          >
            <div
              style={{
                maxWidth: '28rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                backgroundColor: message.sender === 'user' ? '#2563eb' : 'white',
                color: message.sender === 'user' ? 'white' : '#1f2937',
                border: message.sender === 'user' ? 'none' : '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}
            >
              <div style={{ fontSize: '1.25rem', marginTop: '0.125rem' }}>
                {message.sender === 'nova' ? '🤖' : '👤'}
              </div>
              <div style={{ flex: 1 }}>
                {message.hasImage && message.imageUrl && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <img
                      src={message.imageUrl}
                      alt="Uploaded"
                      style={{ maxWidth: '100%', height: 'auto', borderRadius: '0.375rem' }}
                    />
                  </div>
                )}
                <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.25rem' }}>{message.text}</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', opacity: 0.7 }}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ fontSize: '1.25rem' }}>🤖</div>
              <div style={{ width: '1rem', height: '1rem', border: '2px solid #6b7280', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {isFridgeMode ? 'Analyzing your fridge and generating recipes...' : 'ChopChop is thinking...'}
              </span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div style={{ padding: '0.5rem 1rem', backgroundColor: '#f3f4f6', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img
              src={imagePreview}
              alt="Preview"
              style={{ height: '4rem', width: '4rem', objectFit: 'cover', borderRadius: '0.375rem' }}
            />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Image selected</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>{selectedImage?.name}</p>
            </div>
            <button
              onClick={removeImage}
              style={{ color: '#dc2626', fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ backgroundColor: 'white', borderTop: '1px solid #e5e7eb', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              style={{ display: 'none' }}
            />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{ padding: '0.5rem', color: '#6b7280', background: 'none', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
            title="Upload image"
          >
            📷
          </button>
          
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (Shift+Enter for new line)"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                resize: 'none',
                outline: 'none',
                minHeight: '2.5rem',
                maxHeight: '7.5rem',
                fontFamily: 'inherit'
              }}
              rows={1}
            />
          </div>
          
          <button
            onClick={sendMessage}
            disabled={isLoading || (!inputMessage.trim() && !selectedImage)}
            style={{
              padding: '0.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: isLoading || (!inputMessage.trim() && !selectedImage) ? 'not-allowed' : 'pointer',
              opacity: isLoading || (!inputMessage.trim() && !selectedImage) ? 0.5 : 1
            }}
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}