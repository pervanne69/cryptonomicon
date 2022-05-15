<template>
  <div class="container">
    <hr v-if="selectedTicker" class="w-full border-t border-gray-600 my-4"/>
    <section v-if="selectedTicker" class="relative">
      <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
        {{ selectedTicker.name.toUpperCase() }} - {{ selectedTicker.rate }}
      </h3>
      <div
          class="flex items-end border-gray-600 border-b border-l h-64"
          ref="graphItem"
      >
        <div
            v-for="(bar, idx) in normalizedGraph"
            :key="idx"
            ref="graphElement"
            :style="{height: `${bar}%`, width: `${graphElementWidth}px`}"
            class="bg-purple-800 border"
        >
        </div>
      </div>
      <remove-button-graph @delete-graph="$emit('deleteGraph')"/>
    </section>
  </div>
</template>
<script>
import RemoveButtonGraph from './RemoveButtonGraph'
export default {
  components: {
    RemoveButtonGraph
  },
  data() {
    return {
      graphElementWidth: 38,
    }
  },
  emits: {
    deleteGraph: null,
  },
  props: {
    selectedTicker: {
      type: null,
      required: true,
      validator(value) {
        return typeof value === "object"
      }
    },
    graph: {
      type: Array,
      required: true
    },
  },
  computed: {
    normalizedGraph() {
      const maxV = Math.max(...this.graph)
      const minV = Math.min(...this.graph)
      if (maxV === minV) {
        return this.graph.map(() => 50)
      }
      return this.graph.map(price =>
          5 + ((price - minV) * 95) / (maxV - minV)
      )
    }
  },
}
</script>