<template>
  <div class="nearby-container">
    <h2>Nearby Mosques</h2>
    <button @click="getLocation">📍 Find Nearby</button>

    <div v-if="loading">Loading nearby mosques...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <ul v-if="mosques.length">
      <li v-for="mosque in mosques" :key="mosque.name">
        <router-link :to="`/mosque/${mosque.id}`">
          {{ mosque.name }} — {{ mosque.distance.toFixed(2) }} km
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "NearbyMosques",
  data() {
    return {
      mosques: [],
      loading: false,
      error: null,
    };
  },
  methods: {
    getLocation() {
      if (!navigator.geolocation) {
        this.error = "Geolocation not supported.";
        return;
      }

      this.loading = true;
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          try {
            const res = await fetch("/.netlify/functions/nearby-mosques", {
              method: "POST",
              body: JSON.stringify({ lat, lon }),
            });

            const data = await res.json();
            this.mosques = data.mosques || [];
          } catch (e) {
            this.error = "Could not fetch nearby mosques.";
          } finally {
            this.loading = false;
          }
        },
        () => {
          this.error = "Permission denied or location error.";
          this.loading = false;
        }
      );
    },
  },
};
</script>

<style scoped>
.nearby-container {
  padding: 24px;
  font-family: 'Segoe UI', sans-serif;
}
ul {
  margin-top: 20px;
}
li {
  margin-bottom: 12px;
}
.error {
  color: red;
}
button {
  padding: 8px 16px;
  background-color: #008000;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
