<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { io } from 'socket.io-client'

interface Message {
  id: string
  username: string
  text: string
  time: string
}

interface User {
  id: string
  username: string
  room: string
}

const socket = io('http://localhost:3000')

const roomUser = ref('')
const username = ref('')
const message = ref('')
const allUsers = ref<User[]>([])
const messages = ref<Message[]>([])
const isTyping = ref(false)
const typingUsers = ref('')

const router = useRouter()

const checkUsername = (username: string) => {
  // Emit 'checkUsername' event to the server
  socket.emit('checkUsername', username, (isUsernameUsed: boolean) => {
    if (isUsernameUsed) {
      // Handle the case where the username is already in use
      alert('Username already taken')
      router.push('/')
    } else {
      // Username is available, proceed with joining the room
      socket.emit('joinRoom', { username, room: roomUser.value })
    }
  })
}

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  username.value = params.get('username') || ''
  roomUser.value = params.get('room') || ''

  // deteksi username apakah ada yang sama
  checkUsername(username.value)

  socket.on('roomUsers', ({ room, users }) => {
    allUsers.value = users
  })

  socket.on('message', (message) => {
    messages.value.push(message)
  })

  socket.on('typing', (data) => {
    typingUsers.value = data
    isTyping.value = true
    setTimeout(() => {
      isTyping.value = false
    }, 1500)
  })
})

const sendChat = () => {
  if (message.value) {
    socket.emit('chatMessage', message.value)
    message.value = ''
  }
}

const leaveRoom = () => {
  router.push('/')
  socket.emit('leaveRoom')
}

const typing = () => {
  socket.emit('typing', username.value)
}
</script>
<template>
  <div class="chat-container">
    <header class="chat-header">
      <h1><i class="fas fa-smile"></i> ChatCord</h1>
      <a @click="leaveRoom" class="btn btnLogout">Leave Room</a>
    </header>
    <main class="chat-main">
      <div class="chat-sidebar">
        <h3><i class="fas fa-comments"></i> Room Name:</h3>
        <h2 id="room-name">
          {{ roomUser }}
        </h2>
        <h3><i class="fas fa-users"></i> Users</h3>
        <ul id="users">
          <li v-for="user in allUsers" :key="user.id">{{ user.username }}</li>
        </ul>
      </div>
      <div class="chat-messages">
        <div v-for="msg in messages" class="message" :key="msg.id">
          <p class="meta" v-if="msg.username !== username">
            {{ msg.username }} <span>{{ msg.time }}</span>
          </p>
          <p
            :class="{
              'text-right': msg.username === username,
              'text-primary': msg.username !== username
            }"
          >
            {{ msg.text }}
          </p>
        </div>

        <!-- typing indicator -->
        <div v-if="isTyping" class="typing">
          <p>{{ typingUsers }} is typing...</p>
        </div>
      </div>
    </main>
    <div class="chat-form-container">
      <form @submit.prevent="sendChat">
        <input
          id="msg"
          type="text"
          placeholder="Enter Message"
          required
          autocomplete="off"
          v-model="message"
          @input="typing"
        />
        <button type="submit" class="btn btnSubmit"><i class="fas fa-paper-plane"></i> Send</button>
      </form>
    </div>
  </div>
</template>
