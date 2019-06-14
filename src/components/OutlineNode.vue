<template>
  <li>
    {{ node.props.title }}
    <span v-for="(tag, idx) in node.props.tags" v-bind:key="idx">
      [{{ tag }}]
    </span>
    {{ niceDate }}
    <!-- Comment out next line to reduce chattiness-->
    {{ node.calendarDay }}
    <ol>
      <outline-node
        v-for="child in node.children"
        v-bind:node="child"
        v-bind:key="child.id"
      />
    </ol>
  </li>
</template>

<script>
export default {
  name: "OutlineNode",
  props: ["node"],
  computed: {
    niceDate: function() {
      return this.node.calendarDay
        ? this.node.calendarDay.date.format("ddd/DD-MMM")
        : "";
    }
  }
};
</script>
