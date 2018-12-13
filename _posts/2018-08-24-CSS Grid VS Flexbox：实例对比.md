---
layout: post
title: CSS Grid VS Flexbox：实例对比
categories: 前端技术
description: some word here
tags: grid flexbox
---
* content
{:toc}
<div class="postImg" style="background-image:url(https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/675733-cad4d95cbb4c9fc0.jpg)"></div>
不久以前，所有 HTML 页面的布局还都是通过 tables、floats 以及其他的 CSS 属性来完成的。面对复杂页面的布局，却没有很好的办法。

然而 Flexbox 的出现，便轻松的解决了复杂的 Web 布局。它是一种专注于创建稳定的响应式页面的布局模式，并可以轻松地正确对齐元素及其内容。如今已是大多数 Web 开发人员首选的 CSS 布局方式。

现在，又出现了一个构建 HTML 最佳布局体系的新竞争者。（冠军头衔正在争夺中…）它就是强大的 CSS Grid 布局。直到本月月底，它也将在 Firefox 52 和 Chrome 57 上得到原生支持，相信不久也会得到其他浏览器兼容性的支持。



## 基本布局测试

要了解这两个体系构建布局的方式，我们将通过相同的 HTML 页面，利用不同的布局方式 （即 Flexbox 与 CSS Grid）为大家区分。

同时，你也可以通过文章顶部附近的下载按钮，下载演示项目进行对比，或者通过在线演示来察看它们：
![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/675733-1a128310e884a63e.png)

该页面的设计相对比较简单 – 它是由一个居中的容器组成，在其内部则包含了标头、主要内容部分、侧边栏和页脚。接下来，我们要完成同时保持 CSS 和 HTML 尽可能整洁的挑战事项：

1. 在布局中将四个主要的部分进行定位.
2. 将页面变为响应式页面.
3. 对齐标头：导航朝左对齐，按钮向右对齐.

如你所见，为了便于比较，我们将所有事项从简处理。那么，让我们从第一个挑战事项开始吧！

## 挑战 1：定位页面部分

### Flexbox 解决方案

我们将从 Flexbox 解决方案开始。我们将为容器添加display: flex来指定为 Flex 布局，并指定子元素的垂直方向。

```css
.container {
    display: flex;
    flex-direction: column;
}
```

现在我们需要使主要内容部分和侧边栏彼此相邻。由于 Flex 容器通常是单向的，所以我们需要添加一个包装器元素。

```html
<header></header>
<div class="main-and-sidebar-wrapper">
    <section class="main"></section>
    <aside class="sidebar"></aside>
</div>
<footer></footer>
```

然后，我们给包装器在反向添加 `display: flex` 和 `flex-direction` 属性。

```css
.main-and-sidebar-wrapper {
    display: flex;
    flex-direction: row;
}
```

最后一步，我们将设置主要内容部分与侧边栏的大小。通过 Flex 实现后，主要内容部分会比侧边栏大三倍。

```css
.main {
    flex: 3;
    margin-right: 60px;
}
.sidebar {
   flex: 1;
}
```

如你所见，Flex 将其很好的实现了出来，但是仍需要相当多的 CSS 属性，并借助了额外的 HTML 元素。那么，让我们看看 CSS Grid 如何实现的。

### CSS Grid 解决方案

针对本项目，有几种不同的 CSS Grid 解决方法，但是我们将使用网格模板区域语法来实现，因为它似乎最适合我们要完成的工作。

首先，我们将定义四个网格区域，所有的页面各一个：

```html
<header></header>
<!-- Notice there isn't a wrapper this time -->
<section class="main"></section>
<aside class="sidebar"></aside>
<footer></footer>
```

```css
header {
    grid-area: header;
}
.main {
    grid-area: main;
}
.sidebar {
    grid-area: sidebar;
}
footer {
    grid-area: footer;
}
```

然后，我们会设置网格并分配每个区域的位置。初次接触 Grid 布局的朋友，可能感觉以下的代码会有些复杂，但当你了解了网格体系，就很容易掌握了。

```css
.container {
    display: grid;

    /*  Define the size and number of columns in our grid. 
    The fr unit works similar to flex:
    fr columns will share the free space in the row in proportion to their value.
    We will have 2 columns - the first will be 3x the size of the second.  */
    grid-template-columns: 3fr 1fr;

    /*  Assign the grid areas we did earlier to specific places on the grid. 
        First row is all header.
        Second row is shared between main and sidebar.
        Last row is all footer.  */
    grid-template-areas: 
        "header header"
        "main sidebar"
        "footer footer";

    /*  The gutters between each grid cell will be 60 pixels. */
    grid-gap: 60px;
}
```

就是这样！ 我们现在将遵循上述结构进行布局，甚至不需要我们处理任何的 margins 或 paddings 。

## 挑战 2：将页面变为响应式页面

### Flexbox 解决方案

这一步的执行与上一步密切相关。对于 Flexbox 解决方案，我们将更改包装器的 `flex-direction` 属性，并调整一些 `margins`。

```css
@media (max-width: 600px) {
    .main-and-sidebar-wrapper {
        flex-direction: column;
    }

    .main {
        margin-right: 0;
        margin-bottom: 60px;
    }
}
```

由于网页比较简单，所以我们在媒体查询上不需要太多的重写。但是，如果遇见更为复杂的布局，那么将会重新的定义相当多的内容。

### CSS Grid 解决方案

由于我们已经定义了网格区域，所以我们只需要在媒体查询中重新排序它们。 我们可以使用相同的列设置。

```css
@media (max-width: 600px) {
    .container {
    /*  Realign the grid areas for a mobile layout. */
        grid-template-areas: 
            "header header"
            "main main"
            "sidebar sidebar"
            "footer footer";
    }
}
```

或者，我们可以从头开始重新定义整个布局。

```css
@media (max-width: 600px) {
    .container {
        /*  Redefine the grid into a single column layout. */
        grid-template-columns: 1fr;
        grid-template-areas: 
            "header"
            "main"
            "sidebar"
            "footer";
    }
}
```

## 挑战 3：对齐标头组件

### Flexbox 解决方案

我们的标头包含了导航和一个按钮的相关链接。我们希望导航朝左对齐，按钮向右对齐。而导航中的链接务必正确对齐，且彼此相邻。

```html
<header>
    <nav>
        <li><a href="#"><h1>Logo</h1></a></li>
        <li><a href="#">Link</a></li>
        <li><a href="#">Link</a></li>
    </nav>
    <button>Button</button>
</header>
```

我们曾在一篇较早的文章中使用 Flexbox 做了类似的布局：响应式标头最简单的制作方法。这个技术很简单：

```css
header {
    display: flex;
    justify-content: space-between;
}
```

现在导航列表和按钮已正确对齐。下来我们将使 `<nav>` 内的 items 进行水平移动。这里最简单的方法就是使用 `display：inline-block` 属性，但目前我们需要使用一个 Flexbox 解决方案：

```css
header nav {
    display: flex;
    align-items: baseline;
}
```

仅两行代码就搞定了！ 还不错吧。接下来让我们看看如何使用 CSS Grid 解决它。

### CSS Grid 解决方案

为了拆分导航和按钮，我们要为标头定义 `display: grid` 属性，并设置一个 2 列的网格。同时，我们还需要两行额外的 CSS 代码，将它们定位在相应的边界上。

```css
header{
    display: grid;
    grid-template-columns: 1fr 1fr;
}
header nav {
    justify-self: start;
}
header button {
    justify-self: end;
}
```

至于导航中的内链 - 这是我们使用 CSS grid 最好的布局展示：

![](https://likonion-1254082995.cos.ap-chengdu.myqcloud.com/media/675733-bd93d208a446870e.png)

虽然链接为内链形式，但它们不能正确的对齐。由于 CSS grid 不具备基线选项（不像 Flexbox 具备的 `align-items` 属性），所以我们只能再定义一个子网格。

```css
header nav {
    display: grid;
    grid-template-columns: auto 1fr 1fr;
    align-items: end; 
}
```

CSS grid 在此步骤中，存在一些明显的布局上的缺陷。但你也不必过于惊讶。因为它的目标是对齐容器，而不是内部的内容。所以，用它来处理收尾工作，或许不是很好的选择哦。

## 结论

如果你已经浏览完整篇文章，那么结论不会让你感到意外。事实上，并不存在最好的布局方式。Flexbox 和 CSS grid 是两种不同的布局形式，我们应该根据具体的场景将它们搭配使用，而不是相互替代。

对于那些跳过文章只想看结论的朋友（不用担心，我们也这样做），这里是通过实例比较后的总结：

1. CSS grids 适用于布局大画面。它们使页面的布局变得非常容易，甚至可以处理一些不规则和非对称的设计。
2. Flexbox 非常适合对齐元素内的内容。你可以使用 Flex 来定位设计上一些较小的细节。
3. 2D 布局适合使用 CSS grids（行与列）。
4. Flexbox 适用于单一维度的布局（行或列）。
5. 共同学习并使用它们。

