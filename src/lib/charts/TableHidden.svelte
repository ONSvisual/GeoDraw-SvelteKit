<script>
    import { groupData } from "$lib/util/functions";

    export let data;
    export let suffix = "%";
    export let yKey = "category";
    export let zKey = "areanm";

    $: grouped_data = groupData(data, yKey);
</script>

{#if grouped_data}
<table class="visuallyhidden">
    <thead>
        <tr>
            <th>Category</th>
            {#each grouped_data[0].values as val}
            <td>{val[zKey]}</td>
            {/each}
        </tr>
    </thead>
    <tbody>
        {#each grouped_data as row}
        <tr>
            <td>{row.label}</td>
            {#each row.values as col}
            <td>{col.value}{suffix}</td>
            {/each}
        </tr>
        {/each}
    </tbody>
</table>
{/if}