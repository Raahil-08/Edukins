import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, BookOpen, Award, LogOut } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const stats = [
    { label: 'Lessons Completed', value: '12', icon: BookOpen },
    { label: 'Current Grade', value: '5', icon: Award },
    { label: 'Subjects Studied', value: '6', icon: User },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={40} color="#6366f1" />
            </View>
            <Text style={styles.name}>{user?.name}</Text>
            <View style={styles.emailContainer}>
              <Mail size={16} color="#6b7280" />
              <Text style={styles.email}>{user?.email}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Learning Progress</Text>
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <View key={index} style={styles.statCard}>
                <View style={styles.statIcon}>
                  <IconComponent size={24} color="#6366f1" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    paddingBottom: 32,
  },
  header: {
    backgroundColor: '#ffffff',
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  email: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 4,
  },
  statsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionsContainer: {
    padding: 16,
  },
  logoutButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginLeft: 8,
  },
});