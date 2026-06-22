import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  variant?: 'add' | 'decrease' | 'reset';
  icon?: React.ReactNode;
}

export default function CustomButton({ title, onPress, onPressIn, onPressOut, variant = 'add', icon }: CustomButtonProps) {
  const buttonStyle = [
    styles.button,
    variant === 'decrease' && styles.decreaseButton,
    variant === 'reset' && styles.resetButton,
  ];

  return (
    <TouchableOpacity
      style={[buttonStyle, { flexDirection: 'row', alignItems: 'center' }]}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      {icon}
      <Text style={[styles.buttonText, icon ? { marginLeft: 6 } : null]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#68b893',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginHorizontal: 5,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  decreaseButton: {
    backgroundColor: '#ff7c69',
  },
  resetButton: {
    backgroundColor: '#786951',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
