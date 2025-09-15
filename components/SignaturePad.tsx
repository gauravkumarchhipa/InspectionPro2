import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { PenTool, RotateCcw, Check } from 'lucide-react-native';
import SignatureScreen from 'react-native-signature-canvas';

interface SignaturePadProps {
  onSignatureCapture: (signature: string) => void;
  title?: string;
  placeholder?: string;
}

export default function SignaturePad({ 
  onSignatureCapture, 
  title = "Digital Signature",
  placeholder = "Sign here"
}: SignaturePadProps) {
  const signatureRef = useRef<any>(null);
  const [hasSignature, setHasSignature] = useState(false);

  const handleSignature = (signature: string) => {
    setHasSignature(true);
    onSignatureCapture(signature);
  };

  const handleClear = () => {
    signatureRef.current?.clearSignature();
    setHasSignature(false);
  };

  const handleConfirm = () => {
    if (hasSignature) {
      signatureRef.current?.readSignature();
    } else {
      Alert.alert('No Signature', 'Please provide a signature before confirming.');
    }
  };

  const style = `
    .m-signature-pad {
      box-shadow: none;
      border: 2px dashed #E5E5EA;
      border-radius: 8px;
      background-color: #FFFFFF;
    }
    .m-signature-pad--body {
      border: none;
    }
    .m-signature-pad--footer {
      display: none;
    }
    body, html {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
    }
  `;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <PenTool size={20} color="#007AFF" />
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <View style={styles.signatureContainer}>
        <SignatureScreen
          ref={signatureRef}
          onOK={handleSignature}
          onEmpty={() => setHasSignature(false)}
          onBegin={() => setHasSignature(true)}
          descriptionText={placeholder}
          clearText="Clear"
          confirmText="Confirm"
          webStyle={style}
          autoClear={false}
          imageType="image/png"
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <RotateCcw size={16} color="#FF3B30" />
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.confirmButton, !hasSignature && styles.confirmButtonDisabled]} 
          onPress={handleConfirm}
          disabled={!hasSignature}
        >
          <Check size={16} color="#FFFFFF" />
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  signatureContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
    gap: 6,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  confirmButtonDisabled: {
    backgroundColor: '#E5E5EA',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});