# Column Configuration Guide for DataTable

This guide provides a detailed explanation of column configuration for the DataTable component, including basic and advanced customization options.

## Table of Contents

- [Introduction](#introduction)
- [Basic Column Configuration](#basic-column-configuration)
- [Column Types and Properties](#column-types-and-properties)
- [Custom Cell Rendering](#custom-cell-rendering)
- [Custom Header Rendering](#custom-header-rendering)
- [Column Filtering](#column-filtering)
- [Column Sorting](#column-sorting)
- [Column Visibility](#column-visibility)
- [Column Sizing](#column-sizing)
- [Advanced Customization](#advanced-customization)
- [Best Practices](#best-practices)
- [Examples](#examples)

## Introduction

The DataTable component uses the `TableColumnDef` type to define columns, which extends the `ColumnDef` type from `@tanstack/react-table` with additional meta properties for custom filtering and other features.

## Basic Column Configuration

A basic column definition includes the following properties:

```tsx
const columns: TableColumnDef<Product, any>[] = [
    {
        accessorKey: "name",
        header: "Product Name",
        cell: info => info.getValue()
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: info => info.getValue()
    },
    {
        accessorKey: "price",
        header: "Price",
        cell: info => `$${info.getValue()}`
    }
];
```

## Column Types and Properties

### TableColumnDef Type

```tsx
export type TableColumnDef<TData, TValue> = ColumnDef<TData, TValue> & {
    meta?: ColumnMeta<TData>;
};

type ColumnMeta<TData> = {
    filterComponent?: (column: Column<TData, any>) => JSX.Element;
};
```

### Common Column Properties

| Property | Type | Description |
|----------|------|-------------|
| `accessorKey` | `string` | The key to access the data in the row |
| `header` | `string \| (() => React.ReactNode)` | The header text or a function that returns a React node |
| `cell` | `(info: CellContext<TData, TValue>) => React.ReactNode` | Function to render the cell content |
| `enableSorting` | `boolean` | Whether the column is sortable |
| `enableFiltering` | `boolean` | Whether the column is filterable |
| `meta` | `ColumnMeta<TData>` | Additional metadata for the column |

## Custom Cell Rendering

You can customize cell rendering using the `cell` property:

```tsx
{
    accessorKey: "status",
    header: "Status",
    cell: (info) => {
        const status = info.getValue() as string;
        return (
            <div className={`status-badge status-${status.toLowerCase()}`}>
                {status}
            </div>
        );
    }
}
```

### Accessing Row Data

You can access the entire row data using `info.row.original`:

```tsx
{
    accessorKey: "actions",
    header: "Actions",
    cell: (info) => {
        const product = info.row.original;
        return (
            <div className="flex gap-2">
                <button onClick={() => handleEdit(product.id)}>Edit</button>
                <button onClick={() => handleDelete(product.id)}>Delete</button>
            </div>
        );
    }
}
```

### Formatting Values

You can format values in the cell renderer:

```tsx
{
    accessorKey: "price",
    header: "Price",
    cell: (info) => {
        const price = info.getValue() as number;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }
}
```

### Conditional Rendering

You can conditionally render cell content:

```tsx
{
    accessorKey: "stock",
    header: "Stock",
    cell: (info) => {
        const stock = info.getValue() as number;
        return (
            <span className={stock < 10 ? 'text-red-500' : 'text-green-500'}>
                {stock}
            </span>
        );
    }
}
```

## Custom Header Rendering

You can customize header rendering using the `header` property:

```tsx
{
    accessorKey: "price",
    header: () => (
        <div className="flex items-center">
            <span>Price</span>
            <InfoTooltip content="Price in USD" />
        </div>
    ),
    cell: (info) => `$${info.getValue()}`
}
```

## Column Filtering

The DataTable component supports custom filter components for each column using the `meta.filterComponent` property:

```tsx
{
    accessorKey: "name",
    header: "Product Name",
    enableSorting: true,
    meta: {
        filterComponent: (column) => (
            <input
                type="search"
                onChange={debounce(
                    (e: ChangeEvent<HTMLInputElement>) =>
                        column.setFilterValue(e.target.value),
                    500
                )}
                placeholder="Filter by name..."
            />
        )
    }
}
```

### Text Filter

```tsx
meta: {
    filterComponent: (column) => (
        <input
            type="search"
            onChange={debounce(
                (e: ChangeEvent<HTMLInputElement>) =>
                    column.setFilterValue(e.target.value),
                500
            )}
            placeholder="Filter..."
        />
    )
}
```

### Select Filter

```tsx
meta: {
    filterComponent: (column) => (
        <select
            onChange={(e) => column.setFilterValue(e.target.value)}
            value={(column.getFilterValue() as string) ?? ""}
        >
            <option value="">All</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="food">Food</option>
        </select>
    )
}
```

### Number Range Filter

```tsx
meta: {
    filterComponent: (column) => {
        const [min, max] = (column.getFilterValue() as [number, number]) || [0, 1000];
        
        return (
            <div className="flex gap-2">
                <input
                    type="number"
                    value={min}
                    onChange={(e) => {
                        const value = parseInt(e.target.value);
                        column.setFilterValue([value, max]);
                    }}
                    placeholder="Min"
                    className="w-20"
                />
                <span>to</span>
                <input
                    type="number"
                    value={max}
                    onChange={(e) => {
                        const value = parseInt(e.target.value);
                        column.setFilterValue([min, value]);
                    }}
                    placeholder="Max"
                    className="w-20"
                />
            </div>
        );
    }
}
```

### Date Range Filter

```tsx
meta: {
    filterComponent: (column) => {
        const [start, end] = (column.getFilterValue() as [string, string]) || ["", ""];
        
        return (
            <div className="flex gap-2">
                <input
                    type="date"
                    value={start}
                    onChange={(e) => {
                        column.setFilterValue([e.target.value, end]);
                    }}
                    className="w-32"
                />
                <span>to</span>
                <input
                    type="date"
                    value={end}
                    onChange={(e) => {
                        column.setFilterValue([start, e.target.value]);
                    }}
                    className="w-32"
                />
            </div>
        );
    }
}
```

### Debounced Filtering

To prevent excessive API calls during filtering, use the `debounce` utility:

```tsx
import { debounce } from "@/lib/utils";

meta: {
    filterComponent: (column) => (
        <input
            type="search"
            onChange={debounce(
                (e: ChangeEvent<HTMLInputElement>) =>
                    column.setFilterValue(e.target.value),
                500
            )}
            placeholder="Filter..."
        />
    )
}
```

## Column Sorting

Sorting is enabled by default for all columns. You can control sorting at the column level using the `enableSorting` property:

```tsx
{
    accessorKey: "name",
    header: "Product Name",
    enableSorting: true,
    cell: info => info.getValue()
}
```

### Custom Sorting

You can customize sorting behavior using the `sortingFn` property:

```tsx
{
    accessorKey: "name",
    header: "Product Name",
    enableSorting: true,
    sortingFn: (rowA, rowB, columnId) => {
        const valueA = rowA.getValue(columnId) as string;
        const valueB = rowB.getValue(columnId) as string;
        return valueA.localeCompare(valueB, undefined, { sensitivity: 'base' });
    }
}
```

## Column Visibility

You can control column visibility using the `enableHiding` property:

```tsx
{
    accessorKey: "description",
    header: "Description",
    enableHiding: true,
    cell: info => info.getValue()
}
```

## Column Sizing

You can control column sizing using the `size` property:

```tsx
{
    accessorKey: "name",
    header: "Product Name",
    size: 200,
    cell: info => info.getValue()
}
```

### Flexible Sizing

You can use the `minSize` and `maxSize` properties to control the minimum and maximum size of a column:

```tsx
{
    accessorKey: "name",
    header: "Product Name",
    minSize: 100,
    maxSize: 300,
    cell: info => info.getValue()
}
```

## Advanced Customization

### Accessor Functions

Instead of using `accessorKey`, you can use `accessorFn` to access nested or computed data:

```tsx
{
    id: "fullName",
    header: "Full Name",
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    cell: info => info.getValue()
}
```

### Cell Context

The cell function receives a context object with useful properties:

```tsx
{
    accessorKey: "actions",
    header: "Actions",
    cell: (info) => {
        const { row, table, column } = info;
        const product = row.original;
        
        return (
            <div className="flex gap-2">
                <button onClick={() => table.options.meta?.onEdit?.(product.id)}>Edit</button>
                <button onClick={() => table.options.meta?.onDelete?.(product.id)}>Delete</button>
            </div>
        );
    }
}
```

### Column Groups

You can group columns using the `columns` property:

```tsx
{
    header: "Product Details",
    columns: [
        {
            accessorKey: "name",
            header: "Name",
            cell: info => info.getValue()
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: info => info.getValue()
        }
    ]
}
```

## Best Practices

### Performance Optimization

1. **Memoize Column Definitions**: Use `useMemo` to memoize column definitions to prevent unnecessary re-renders.

```tsx
const columns = useMemo(() => [
    // Column definitions
], []);
```

2. **Debounce Filter Inputs**: Always debounce filter inputs to prevent excessive API calls.

```tsx
import { debounce } from "@/lib/utils";

meta: {
    filterComponent: (column) => (
        <input
            type="search"
            onChange={debounce(
                (e: ChangeEvent<HTMLInputElement>) =>
                    column.setFilterValue(e.target.value),
                500
            )}
            placeholder="Filter..."
        />
    )
}
```

3. **Optimize Cell Rendering**: Avoid complex calculations in cell rendering functions.

### Type Safety

1. **Use Proper Types**: Always use proper types for your column definitions.

```tsx
const columns: TableColumnDef<Product, any>[] = [
    // Column definitions
];
```

2. **Type Cell Values**: Use type assertions to ensure type safety in cell rendering functions.

```tsx
cell: (info) => {
    const price = info.getValue() as number;
    return `$${price.toFixed(2)}`;
}
```

### Code Organization

1. **Separate Column Definitions**: Define columns in a separate file for better organization.

```tsx
// productColumns.ts
export const productColumns: TableColumnDef<Product, any>[] = [
    // Column definitions
];

// ProductTable.tsx
import { productColumns } from "./productColumns";
```

2. **Create Reusable Filter Components**: Create reusable filter components for common filter types.

```tsx
// TextFilter.tsx
export const TextFilter = ({ column }: { column: Column<any, any> }) => (
    <input
        type="search"
        onChange={debounce(
            (e: ChangeEvent<HTMLInputElement>) =>
                column.setFilterValue(e.target.value),
            500
        )}
        placeholder="Filter..."
    />
);

// Column definition
meta: {
    filterComponent: (column) => <TextFilter column={column} />
}
```

## Examples

### Basic Column Definition

```tsx
const productColumns: TableColumnDef<Product, any>[] = [
    {
        accessorKey: "name",
        header: "Product Name",
        enableSorting: true,
        cell: info => info.getValue(),
        meta: {
            filterComponent: (column) => (
                <input
                    type="search"
                    onChange={debounce(
                        (e: ChangeEvent<HTMLInputElement>) =>
                            column.setFilterValue(e.target.value),
                        500
                    )}
                    placeholder="Filter by name..."
                />
            )
        }
    },
    {
        accessorKey: "category",
        header: "Category",
        enableSorting: true,
        cell: info => info.getValue(),
        meta: {
            filterComponent: (column) => (
                <select
                    onChange={(e) => column.setFilterValue(e.target.value)}
                    value={(column.getFilterValue() as string) ?? ""}
                >
                    <option value="">All</option>
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                    <option value="food">Food</option>
                </select>
            )
        }
    },
    {
        accessorKey: "price",
        header: "Price",
        enableSorting: true,
        cell: info => `$${(info.getValue() as number).toFixed(2)}`,
        meta: {
            filterComponent: (column) => (
                <input
                    type="number"
                    onChange={debounce(
                        (e: ChangeEvent<HTMLInputElement>) =>
                            column.setFilterValue(e.target.value),
                        500
                    )}
                    placeholder="Filter by price..."
                />
            )
        }
    },
    {
        accessorKey: "stock",
        header: "Stock",
        enableSorting: true,
        cell: info => {
            const stock = info.getValue() as number;
            return (
                <span className={stock < 10 ? 'text-red-500' : 'text-green-500'}>
                    {stock}
                </span>
            );
        },
        meta: {
            filterComponent: (column) => (
                <input
                    type="number"
                    onChange={debounce(
                        (e: ChangeEvent<HTMLInputElement>) =>
                            column.setFilterValue(e.target.value),
                        500
                    )}
                    placeholder="Filter by stock..."
                />
            )
        }
    },
    {
        accessorKey: "actions",
        header: "Actions",
        enableSorting: false,
        enableFiltering: false,
        cell: info => {
            const product = info.row.original;
            return (
                <div className="flex gap-2">
                    <button onClick={() => handleEdit(product.id)}>Edit</button>
                    <button onClick={() => handleDelete(product.id)}>Delete</button>
                </div>
            );
        }
    }
];
```

### Advanced Column Definition with Custom Components

```tsx
import { TextFilter } from "./filters/TextFilter";
import { SelectFilter } from "./filters/SelectFilter";
import { NumberFilter } from "./filters/NumberFilter";
import { StatusBadge } from "./components/StatusBadge";
import { ActionButtons } from "./components/ActionButtons";

const productColumns: TableColumnDef<Product, any>[] = [
    {
        accessorKey: "name",
        header: "Product Name",
        enableSorting: true,
        cell: info => info.getValue(),
        meta: {
            filterComponent: (column) => <TextFilter column={column} placeholder="Filter by name..." />
        }
    },
    {
        accessorKey: "category",
        header: "Category",
        enableSorting: true,
        cell: info => info.getValue(),
        meta: {
            filterComponent: (column) => (
                <SelectFilter
                    column={column}
                    options={[
                        { value: "", label: "All" },
                        { value: "electronics", label: "Electronics" },
                        { value: "clothing", label: "Clothing" },
                        { value: "food", label: "Food" }
                    ]}
                />
            )
        }
    },
    {
        accessorKey: "price",
        header: () => (
            <div className="flex items-center">
                <span>Price</span>
                <InfoTooltip content="Price in USD" />
            </div>
        ),
        enableSorting: true,
        cell: info => `$${(info.getValue() as number).toFixed(2)}`,
        meta: {
            filterComponent: (column) => <NumberFilter column={column} placeholder="Filter by price..." />
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        enableSorting: true,
        cell: info => <StatusBadge status={info.getValue() as string} />,
        meta: {
            filterComponent: (column) => (
                <SelectFilter
                    column={column}
                    options={[
                        { value: "", label: "All" },
                        { value: "in_stock", label: "In Stock" },
                        { value: "low_stock", label: "Low Stock" },
                        { value: "out_of_stock", label: "Out of Stock" }
                    ]}
                />
            )
        }
    },
    {
        accessorKey: "actions",
        header: "Actions",
        enableSorting: false,
        enableFiltering: false,
        cell: info => <ActionButtons product={info.row.original} onEdit={handleEdit} onDelete={handleDelete} />
    }
];
```

### Column Definition with Nested Data

```tsx
const orderColumns: TableColumnDef<Order, any>[] = [
    {
        accessorKey: "id",
        header: "Order ID",
        enableSorting: true,
        cell: info => info.getValue()
    },
    {
        accessorKey: "customer.name",
        header: "Customer",
        enableSorting: true,
        cell: info => info.getValue()
    },
    {
        accessorFn: row => row.items.length,
        header: "Items",
        enableSorting: true,
        cell: info => info.getValue()
    },
    {
        accessorFn: row => row.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        header: "Total",
        enableSorting: true,
        cell: info => `$${(info.getValue() as number).toFixed(2)}`
    },
    {
        accessorKey: "status",
        header: "Status",
        enableSorting: true,
        cell: info => <StatusBadge status={info.getValue() as string} />
    }
];
```
