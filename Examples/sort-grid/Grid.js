export default {
    props: {
        data: Array,
        columns: Array, 
        filterKey: String
    },
    data () {
        return {
            sortKey: '',
            sortOrders: this.columns.reduce((o, key)=> (o[key]=1, o), {}) // return an object of for each key, with value == 1
        }
    },
    computed: {
        filteredData() {
            const sortKey = this.sortKey;
            console.log(this.filterKey);
            // Iterate through the column specified by <sortKey> and 
            // Sort according to sortOrders
            const order = this.sortOrders[sortKey];
            let data = this.data;
            // In-place sort with compareFn
            if (sortKey) {
                data.sort((a, b) => { 
                    a = a[sortKey];
                    b = b[sortKey];    
                    return (a === b ? 0 : a > b ? 1 : -1) * order;
                })
            };

            return data 
        }
    },
    methods: {
        // switch to set asc/dsc sort order for <key>
        sortBy(key) {
            this.sortKey = key;
            // What is this doing???
            this.sortOrders[key] = this.sortOrders[key] * -1
        }
    },
    template: /*html*/ `
    <table>
        <thead>
            <tr>
                <th v-for="key in columns"
                    @click="sortBy(key)"
                >{{key}}
                    <span class="arrow" :class="sortOrders[key] ? 'asc' : 'desc'">
                    </span>
                </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="entry in filteredData">
                <td v-for="cell in entry">
                    {{cell}}
                </td>
            </tr>
        </tbody>
    </table>
    `
}





