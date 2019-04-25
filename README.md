# HBM BurdaNews Styles

A BurdaNews GmbH project.

## Team

### Developers

Christian Puchinger - puchinger@playboy.de

## Usage

Define the following colors:
```
$hbm-color-text: #XXXXXX;
$hbm-color-highlight: #XXXXXX;
$hbm-color-secondary: #XXXXXX;

// Prepare bootstrap variables
$theme-colors: (
  primary: $hbm-color-highlight,
  secondary: $hbm-color-secondary,
);
$body-color: $hbm-color-text;
```

Optionally define the following maps:
```
$toggable-items: ();
$table-cell-widths: (10, 25, 50, 75, 100, 125, 150, 200, 250);
```
