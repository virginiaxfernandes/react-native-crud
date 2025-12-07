import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, Button, FlatList, TouchableOpacity, Alert } from 'react-native';

const BASE_URL = 'http://192.168.10.148:3333'; 

export default function App() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const res = await fetch(`${BASE_URL}/items`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.log('fetch error', err);
      Alert.alert('Erro', 'Não foi possível buscar itens. Verifique o backend.');
    }
  }

  async function saveItem() {
    if (!title.trim()) return Alert.alert('Validação', 'Título é obrigatório');
    try {
      if (editingId) {
        const res = await fetch(`${BASE_URL}/items/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description }),
        });
        const updated = await res.json();
        setItems(prev => prev.map(i => (i.id === updated.id ? updated : i)));
        setEditingId(null);
      } else {
        const res = await fetch(`${BASE_URL}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description }),
        });
        const created = await res.json();
        setItems(prev => [created, ...prev]);
      }
      setTitle('');
      setDescription('');
    } catch (err) {
      console.log('save error', err);
      Alert.alert('Erro', 'Não foi possível salvar o item');
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
  }

  async function deleteItem(id) {
    try {
      await fetch(`${BASE_URL}/items/${id}`, { method: 'DELETE' });
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.log('delete error', err);
      Alert.alert('Erro', 'Não foi possível excluir');
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>CRUD simples</Text>

      <View style={{ marginBottom: 12 }}>
        <TextInput placeholder="Título" value={title} onChangeText={setTitle} style={{ borderWidth: 1, padding: 8, marginBottom: 6 }} />
        <TextInput placeholder="Descrição" value={description} onChangeText={setDescription} style={{ borderWidth: 1, padding: 8, marginBottom: 6 }} />
        <Button title={editingId ? 'Atualizar' : 'Criar'} onPress={saveItem} />
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderWidth: 1, marginBottom: 8 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
            <Text>{item.description}</Text>
            <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
              <TouchableOpacity onPress={() => startEdit(item)} style={{ marginRight: 8 }}>
                <Text>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteItem(item.id)}>
                <Text>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}