import '../../stylus/components/_tables.styl'
import '../../stylus/components/_data-table.styl'

import DataIterable from '../../mixins/data-iterable'

import Head from './mixins/head'
import Body from './mixins/body'
import Foot from './mixins/foot'
import Progress from './mixins/progress'

import {
  createSimpleFunctional,
  getObjectValueByPath
} from '../../util/helpers'

// Importing does not work properly
const VTableOverflow = createSimpleFunctional('v-table__overflow')

/* @vue/component */
export default {
  name: 'v-data-table',

  mixins: [DataIterable, Head, Body, Foot, Progress],

  props: {
    headers: {
      type: Array,
      default: () => []
    },
    headersLength: {
      type: Number
    },
    headerText: {
      type: String,
      default: 'text'
    },
    headerKey: {
      type: String,
      default: null
    },
    hideHeaders: Boolean,
    rowsPerPageText: {
      type: String,
      default: '$vuetify.dataTable.rowsPerPageText'
    },
    customFilter: {
      type: Function,
      default: (items, search, filter, headers) => {
        search = search.toString().toLowerCase()
        if (search.trim() === '') return items

        const props = headers.map(h => h.value)

        return items.filter(item => props.some(prop => filter(getObjectValueByPath(item, prop, item[prop]), search)))
      }
    }
  },

  data () {
    return {
      actionsClasses: 'v-datatable__actions',
      actionsRangeControlsClasses: 'v-datatable__actions__range-controls',
      actionsSelectClasses: 'v-datatable__actions__select',
      actionsPaginationClasses: 'v-datatable__actions__pagination',
      headerBump: false
    }
  },

  computed: {
    classes () {
      return {
        'v-datatable v-table': true,
        'v-datatable--select-all': this.selectAll !== false,
        ...this.themeClasses
      }
    },
    filteredItems () {
      return this.filteredItemsImpl(this.headers)
    },
    headerColumns () {
      return this.headersLength || this.headers.length + (this.selectAll !== false)
    }
  },

  watch: {
      items() {
          this.$nextTick(() =>
              this.headerBump = this.$refs.bodyTable && this.$refs.bodyTable.scrollHeight > this.$refs.bodyTable.getBoundingClientRect().height
          );
      }
  },

  created () {
    const firstSortable = this.headers.find(h => (
      !('sortable' in h) || h.sortable)
    )

    this.defaultPagination.sortBy = !this.disableInitialSort && firstSortable
      ? firstSortable.value
      : null

    this.initPagination()
  },

  methods: {
    hasTag (elements, tag) {
      return Array.isArray(elements) && elements.find(e => e.tag === tag)
    },
    genTR (children, data = {}) {
      return this.$createElement('tr', data, children)
    }
  },

  render (h) {
    const colgroup = h('colgroup', {}, this.headers.map(header => h('col', header.width ? { style: { width: header.width } } : {})));

    const headerTable = h('div', { 'class': { 'v-datatable__head': true, 'bump': this.headerBump } }, [
      h('table', { 'class': this.classes,  }, [
        colgroup,
        this.genTHead()
      ])
    ]);

    const bodyTable = h('div', { 'class': 'v-datatable__body', ref: 'bodyTable' }, [
      h('table', { 'class': this.classes }, [
          colgroup,
          this.genTBody(),
          this.genTFoot()
      ])
    ]);

    return h('div', [
      h(VTableOverflow, {}, [
          headerTable,
          bodyTable
      ]),
      this.genActionsFooter()
    ]);

    // const tableOverflow = h(VTableOverflow, {}, [
    //   h('table', {
    //     'class': this.classes
    //   }, [
    //     this.genTHead(),
    //     this.genTBody(),
    //     this.genTFoot()
    //   ])
    // ])

    // return h('div', [
    //   tableOverflow,
    //   this.genActionsFooter()
    // ])
  }
}