<template>
  <div id="app" class="container">
    <div class="columns">
      <div class="column">
        <Plan />
      </div>
    </div>
  </div>
</template>

<script>
import Plan from "./components/SemesterPlan.vue";

export default {
  name: "app",
  components: {
    Plan
  }
};
</script>

<style></style>
