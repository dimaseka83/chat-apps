<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

interface User {
  username: string
  room: string
}

const user = ref<User>({
  username: '',
  room: ''
})

const router = useRouter()

const submit = () => {
  if (user.value.username.trim() === '' || user.value.room.trim() === '') {
    alert('Username and room are required')
    return
  }

  router.push({ path: '/chat', query: { username: user.value.username, room: user.value.room } })
}
</script>
<template>
  <div class="join-container">
    <header class="join-header">
      <h1><i class="fas fa-smile"></i> ChatCord</h1>
    </header>
    <main class="join-main">
      <form @submit.prevent="submit">
        <div class="form-control">
          <label for="username">Username</label>
          <input
            type="text"
            name="username"
            id="username"
            placeholder="Enter username..."
            required
            v-model="user.username"
          />
        </div>
        <div class="form-control">
          <label for="room">Room</label>
          <select name="room" id="room" v-model="user.room">
            <option value="JavaScript">JavaScript</option>
            <option value="Python">Python</option>
            <option value="PHP">PHP</option>
            <option value="C#">C#</option>
            <option value="Ruby">Ruby</option>
            <option value="Java">Java</option>
          </select>
        </div>
        <button type="submit" class="btn">Join Chat</button>
      </form>
    </main>
  </div>
</template>
