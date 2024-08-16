<script>
    import { groupData } from "$lib/util/functions";

    export let data;
    export let suffix = "%";
    export let yKey = "category";
    export let zKey = "areanm";

    $: groupedData = groupData(data, yKey);
</script>

{#if groupedData}
    <table class="visuallyhidden">
        <thead>
            <tr>
                <th>Category</th>
                {#each groupedData[0].values as val}
                    <td>{val[zKey]}</td>
                {/each}
            </tr>
        </thead>
        <tbody>
            {#each groupedData as row}
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
