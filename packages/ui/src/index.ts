// Side-effect import of the layered stylesheet entry (tokens as `base`,
// component CSS as `components`) so a single
// `import { ... } from '@connor-adams/designsystem'` pulls in all styling.
// The actual file is re-attached to this built entry (and only this one) in
// tsup's `onSuccess` — see tsup.config.ts — so the `./chart` entry can stay
// stylesheet-free. This comment only documents the dependency.

// Chart palette + frame theme as CSS var() strings. Also published on its own
// at `@connor-adams/designsystem/chart`, which is the import to use when you
// only want the palette — that entry carries no stylesheet side-effect.
export { chartColors, chartTheme, chartColor, chartLineColor } from './chart'
export type {
  ChartColors,
  ChartTheme,
  ChartColorToken,
  ChartDomainColors,
  ChartAxisTheme,
  ChartGridTheme,
  ChartTooltipTheme,
} from './chart'

export { Button } from './core/Button'
export type { ButtonProps, ButtonVariant, ButtonSize } from './core/Button'
export { Accordion } from './core/Accordion'
export type { AccordionProps, AccordionItem } from './core/Accordion'
export { Avatar } from './core/Avatar'
export type { AvatarProps } from './core/Avatar'
export { Badge } from './core/Badge'
export type { BadgeProps, BadgeVariant, BadgeSize } from './core/Badge'
export { Card, CardHeader, CardTitle, CardDescription, CardContent } from './core/Card'
export type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardContentProps,
  CardVariant,
  CardPadding,
  CardRadius,
} from './core/Card'
export { Icon, iconNames } from './core/Icon'
export type { IconProps, IconName } from './core/Icon'
export { Kbd } from './core/Kbd'
export type { KbdProps } from './core/Kbd'
export { Link } from './core/Link'
export type { LinkProps } from './core/Link'
export { Progress } from './core/Progress'
export type { ProgressProps, ProgressSegment } from './core/Progress'
export { Separator } from './core/Separator'
export type { SeparatorProps } from './core/Separator'
export { Spinner } from './core/Spinner'
export type { SpinnerProps } from './core/Spinner'
export { Text } from './core/Text'
export type { TextProps, TextTone, TextVariant, TextWeight } from './core/Text'
export { DataTable } from './data/DataTable'
export type {
  DataTableProps,
  DataTableColumn,
  DataTableSort,
  DataTableSortDirection,
  DataTableAlign,
  DataTableComponent,
} from './data/DataTable'
export { ChartFrame, resolveChartHeight } from './data/ChartFrame'
export type { ChartFrameProps, ChartFrameHeight, ChartFramePadding, ChartHeightSpec } from './data/ChartFrame'
export { LetterAvatar } from './data/LetterAvatar'
export type { LetterAvatarProps, LetterAvatarSize } from './data/LetterAvatar'
export { resolveDeltaTone, StatCard } from './data/StatCard'
export type { StatCardProps, MetricKind } from './data/StatCard'
export { StatGrid } from './data/StatGrid'
export type { StatGridProps, StatGridGap } from './data/StatGrid'
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './data/Table'
export type { TableProps, TableRowProps } from './data/Table'
export { Tabs } from './data/Tabs'
export type { TabsProps, TabItem, TabsOverflow } from './data/Tabs'
export { Alert } from './feedback/Alert'
export type { AlertProps, AlertVariant } from './feedback/Alert'
export { EmptyState } from './feedback/EmptyState'
export type { EmptyStateProps } from './feedback/EmptyState'
export { Skeleton, SkeletonText } from './feedback/Skeleton'
export type { SkeletonProps, SkeletonTextProps } from './feedback/Skeleton'
export { AccountCard } from './finance/AccountCard'
export type { AccountCardProps } from './finance/AccountCard'
export { AmountText } from './finance/AmountText'
export type { AmountTextProps } from './finance/AmountText'
export { CategoryBreakdown } from './finance/CategoryBreakdown'
export type { CategoryBreakdownProps, CategoryBreakdownRow } from './finance/CategoryBreakdown'
export { BudgetMeter } from './finance/BudgetMeter'
export type { BudgetMeterProps } from './finance/BudgetMeter'
export { CategoryPill } from './finance/CategoryPill'
export type { CategoryPillProps } from './finance/CategoryPill'
export { categoryVisual, categoryIconName } from './finance/categoryIcon'
export type { CategoryVisual, CategoryOverrides } from './finance/categoryIcon'
export { ImportDropzone } from './finance/ImportDropzone'
export type { ImportDropzoneProps, ImportDropzoneRejection } from './finance/ImportDropzone'
export { MoneyInput } from './finance/MoneyInput'
export type { MoneyInputProps } from './finance/MoneyInput'
export { PeriodSelector } from './finance/PeriodSelector'
export type { PeriodSelectorProps, PeriodPreset } from './finance/PeriodSelector'
export { Sparkline } from './finance/Sparkline'
export type { SparklineProps } from './finance/Sparkline'
export { Checkbox } from './forms/Checkbox'
export type { CheckboxProps } from './forms/Checkbox'
export { Combobox } from './forms/Combobox'
export type { ComboboxProps, ComboboxOption } from './forms/Combobox'
export { Field } from './forms/Field'
export type { FieldProps, FieldChildren, FieldControlProps } from './forms/Field'
export { Input } from './forms/Input'
export type { InputProps } from './forms/Input'
export { Label } from './forms/Label'
export type { LabelProps } from './forms/Label'
export { NativeSelect } from './forms/NativeSelect'
export type { NativeSelectProps, SelectOption } from './forms/NativeSelect'
export { RadioGroup } from './forms/RadioGroup'
export type { RadioGroupProps, RadioOption } from './forms/RadioGroup'
export { Slider } from './forms/Slider'
export type { SliderProps } from './forms/Slider'
export { Stepper } from './forms/Stepper'
export type { StepperProps } from './forms/Stepper'
export { Switch } from './forms/Switch'
export type { SwitchProps } from './forms/Switch'
export { Textarea } from './forms/Textarea'
export type { TextareaProps } from './forms/Textarea'
export { ToggleGroup } from './forms/ToggleGroup'
export type { ToggleGroupProps, ToggleItem } from './forms/ToggleGroup'
export { UploadButton } from './forms/UploadButton'
export type { UploadButtonProps } from './forms/UploadButton'
export { formatFileSize, matchesAccept, selectFiles } from './forms/fileSelect'
export type {
  FileRejection,
  FileRejectionCode,
  FileSelectResult,
  FileSelectRules,
} from './forms/fileSelect'
export { Breadcrumb } from './navigation/Breadcrumb'
export type { BreadcrumbProps, BreadcrumbItem } from './navigation/Breadcrumb'
export { Pagination } from './navigation/Pagination'
export type { PaginationProps } from './navigation/Pagination'
export { Dialog } from './overlays/Dialog'
export type { DialogProps } from './overlays/Dialog'
export { ConfirmDialog, useConfirm } from './overlays/ConfirmDialog'
export type { ConfirmDialogProps, ConfirmTone, ConfirmOptions, UseConfirmResult } from './overlays/ConfirmDialog'
export { useDismissLayer, pushDismissLayer, dismissStackSize } from './overlays/dismissStack'
export type { DismissLayer, DismissLayerOptions } from './overlays/dismissStack'
export { useBodyScrollLock } from './overlays/bodyScrollLock'
export { DropdownMenu } from './overlays/DropdownMenu'
export type { DropdownMenuProps, DropdownItem } from './overlays/DropdownMenu'
export { Toast } from './overlays/Toast'
export type { ToastProps, ToastVariant } from './overlays/Toast'
export { Toaster, toast, toastStore, useToast } from './overlays/Toaster'
export type {
  ToasterProps,
  ToasterPosition,
  ToastOptions,
  ToastRecord,
  ToastHelperOptions,
  ToastFn,
  UseToastReturn,
} from './overlays/Toaster'
export { Tooltip } from './overlays/Tooltip'
export type { TooltipProps } from './overlays/Tooltip'
export type { MediaTrack } from './media/types'
export { NowPlayingArtwork } from './media/NowPlayingArtwork'
export type { NowPlayingArtworkProps } from './media/NowPlayingArtwork'
export { TrackInfo } from './media/TrackInfo'
export type { TrackInfoProps } from './media/TrackInfo'
export { ProgressBar } from './media/ProgressBar'
export type { ProgressBarProps } from './media/ProgressBar'
export { PlaybackControls } from './media/PlaybackControls'
export type { PlaybackControlsProps } from './media/PlaybackControls'
export { MediaPlayer } from './media/MediaPlayer'
export type { MediaPlayerProps } from './media/MediaPlayer'
export { QueueList } from './media/QueueList'
export type { QueueListProps } from './media/QueueList'
export { useAudioPreview } from './media/useAudioPreview'
