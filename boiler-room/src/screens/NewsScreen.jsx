import React, { useState, useEffect } from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, ImageBackground, Share, Modal, TextInput, Alert, Image } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useUser } from '../context/UserContext'
import { getNewsArticles, addNewsArticle, updateNewsArticle, deleteNewsArticle } from '../services/newsData'
import * as ImagePicker from 'expo-image-picker'

const GOLD = '#E63946'
const BG = '#000000'
const DEEP_BLUE = '#2D6A4F'

export default function NewsScreen({ navigation }) {
  const { isAdmin } = useUser()
  const [articles, setArticles] = useState([])
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingArticle, setEditingArticle] = useState(null)
  const [formData, setFormData] = useState({ title: '', summary: '', image: null, imageType: null })

  useEffect(() => {
    loadArticles()
  }, [])

  const loadArticles = () => {
    setArticles(getNewsArticles())
  }

  const handleShare = React.useCallback((article) => {
    Share.share({
      message: `${article.title}\n${article.summary}\n\nפורסם ב-Boiler Room App`
    }).catch(() => {})
  }, [])

  const handleAddNew = () => {
    setEditingArticle(null)
    setFormData({ title: '', summary: '', image: null, imageType: null })
    setEditModalVisible(true)
  }

  const handleEdit = (article) => {
    setEditingArticle(article)
    setFormData({
      title: article.title,
      summary: article.summary,
      image: article.image,
      imageType: article.imageType || 'local',
    })
    setEditModalVisible(true)
  }

  const handleDelete = (articleId) => {
    Alert.alert(
      'מחיקת חדשה',
      'האם אתה בטוח שברצונך למחוק את החדשה הזו?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: () => {
            deleteNewsArticle(articleId)
            loadArticles()
            Alert.alert('נמחק', 'החדשה נמחקה בהצלחה')
          },
        },
      ]
    )
  }

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('הרשאה נדרשת', 'אנא אפשר גישה לתמונות')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      setFormData({
        ...formData,
        image: { uri: result.assets[0].uri },
        imageType: 'uri',
      })
    }
  }

  const handleSave = () => {
    if (!formData.title.trim() || !formData.summary.trim()) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות')
      return
    }

    if (editingArticle) {
      updateNewsArticle(editingArticle.id, {
        title: formData.title,
        summary: formData.summary,
        image: formData.image,
        imageType: formData.imageType,
      })
      Alert.alert('עודכן', 'החדשה עודכנה בהצלחה')
    } else {
      addNewsArticle({
        title: formData.title,
        summary: formData.summary,
        image: formData.image,
        imageType: formData.imageType,
      })
      Alert.alert('נוסף', 'החדשה נוספה בהצלחה')
    }

    setEditModalVisible(false)
    loadArticles()
  }

  const renderImage = (article) => {
    if (article.imageType === 'uri' && article.image?.uri) {
      return { uri: article.image.uri }
    }
    return article.image
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[BG, '#f4f6f9']} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="חזרה"
        >
          <Ionicons name="arrow-back" size={24} color={GOLD} />
        </Pressable>
        <Text style={styles.headerTitle}>חדשות</Text>
        {isAdmin && (
          <Pressable
            style={styles.addBtn}
            onPress={handleAddNew}
            accessibilityRole="button"
          >
            <Ionicons name="add-circle" size={28} color={GOLD} />
          </Pressable>
        )}
        {!isAdmin && <View style={{ width: 28 }} />}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>עדכוני מסחר, ידע וכלים מעולם המיינדסט</Text>

        {articles.map((article, idx) => (
          <View key={article.id} style={[styles.articleCard, idx === 0 && styles.articleCardFirst]}>
            <ImageBackground 
              source={renderImage(article)} 
              style={styles.articleCover} 
              imageStyle={styles.articleCoverRadius}
            >
              <LinearGradient colors={[ 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.1)' ]} style={StyleSheet.absoluteFill} />
              <View style={styles.articleTopRow}>
                <View style={styles.datePill}>
                  <Ionicons name="calendar-outline" size={14} color={GOLD} />
                  <Text style={styles.dateText}>{article.date}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {isAdmin && (
                    <>
                      <Pressable
                        onPress={() => handleEdit(article)}
                        style={styles.adminIconBtn}
                        hitSlop={12}
                      >
                        <Ionicons name="create-outline" size={18} color={GOLD} />
                      </Pressable>
                      <Pressable
                        onPress={() => handleDelete(article.id)}
                        style={styles.adminIconBtn}
                        hitSlop={12}
                      >
                        <Ionicons name="trash-outline" size={18} color="#dc2626" />
                      </Pressable>
                    </>
                  )}
                  <Pressable
                    onPress={() => handleShare(article)}
                    style={styles.shareIconBtn}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel={`שיתוף ${article.title}`}
                  >
                    <Ionicons name="share-social-outline" size={18} color={GOLD} />
                  </Pressable>
                </View>
              </View>
              <View style={styles.articleBottom}>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <Text style={styles.articleSummary} numberOfLines={2}>{article.summary}</Text>
              </View>
            </ImageBackground>
          </View>
        ))}

        {!isAdmin && (
          <View style={styles.footerCard}>
            <Ionicons name="create-outline" size={28} color={GOLD} />
            <View style={styles.footerTextBlock}>
              <Text style={styles.footerTitle}>העלאת תוכן ע"י אדמין</Text>
              <Text style={styles.footerDesc}>
                אדמין יכול להוסיף, לערוך ולמחוק חדשות ישירות מהאפליקציה.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Edit/Add Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingArticle ? 'עריכת חדשה' : 'הוספת חדשה חדשה'}
              </Text>
              <Pressable onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={DEEP_BLUE} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>כותרת</Text>
                <TextInput
                  style={styles.input}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  placeholder="הזן כותרת..."
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>תקציר</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.summary}
                  onChangeText={(text) => setFormData({ ...formData, summary: text })}
                  placeholder="הזן תקציר..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>תמונה</Text>
                <Pressable style={styles.imagePickerBtn} onPress={pickImage}>
                  <Ionicons name="image-outline" size={24} color={GOLD} />
                  <Text style={styles.imagePickerText}>
                    {formData.image ? 'תמונה נבחרה' : 'בחר תמונה'}
                  </Text>
                </Pressable>
                {formData.image && (
                  <View style={styles.imagePreview}>
                    <Image
                      source={formData.imageType === 'uri' ? formData.image : formData.image}
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                    <Pressable
                      style={styles.removeImageBtn}
                      onPress={() => setFormData({ ...formData, image: null, imageType: null })}
                    >
                      <Ionicons name="close-circle" size={24} color="#dc2626" />
                    </Pressable>
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelBtnText}>ביטול</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleSave}>
                <LinearGradient colors={[GOLD, '#c49b2e']} style={StyleSheet.absoluteFill} />
                <Text style={styles.saveBtnText}>{editingArticle ? 'שמור שינויים' : 'הוסף חדשה'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212,175,55,0.12)',
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: GOLD,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 36,
    gap: 18,
  },
  subtitle: {
    alignSelf: 'flex-end',
    color: DEEP_BLUE,
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
  },
  articleCard: {
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  articleCardFirst: {
    marginTop: 6,
  },
  articleCover: {
    height: 220,
    justifyContent: 'space-between',
  },
  articleCoverRadius: {
    borderRadius: 22,
  },
  articleTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(212,175,55,0.2)',
  },
  dateText: {
    color: '#fef9c3',
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
  shareIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  adminIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  articleBottom: {
    padding: 18,
    alignItems: 'flex-end',
    gap: 8,
  },
  articleTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'right',
  },
  articleSummary: {
    color: '#f8fafc',
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'right',
  },
  footerCard: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 18,
    backgroundColor: 'rgba(212,175,55,0.1)',
  },
  footerTextBlock: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 4,
  },
  footerTitle: {
    color: DEEP_BLUE,
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  footerDesc: {
    color: '#475569',
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'right',
    lineHeight: 18,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: DEEP_BLUE,
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: DEEP_BLUE,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    textAlign: 'right',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imagePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: GOLD,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(212,175,55,0.05)',
  },
  imagePickerText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: GOLD,
  },
  imagePreview: {
    marginTop: 12,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
  },
  saveBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
})
