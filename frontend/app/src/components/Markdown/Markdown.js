import ReactMarkdown from "react-markdown";
import directive from "remark-directive";
import { visit } from "unist-util-visit";
import remarkGfm from "remark-gfm";
import { forwardRef } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { tomorrowNight } from "react-syntax-highlighter/dist/cjs/styles/hljs";

// // Training Components
// import CustomCode from 'src/components/markdownComponents/CustomCode';
// import BlackBox from 'src/components/markdownComponents/BlackBox';
// import Quote from 'src/components/markdownComponents/Quote';
// import RedirectCard from 'src/components/markdownComponents/RedirectCard';
// import Terminal from 'src/components/markdownComponents/Terminal';
// import RedirectButton from 'src/components/markdownComponents/RedirectButton';
// import QuestionList from 'src/components/markdownComponents/QuestionList';
// import TextQuestion from 'src/components/markdownComponents/TextQuestion';
// import RadioQuestion from 'src/components/markdownComponents/RadioQuestion';
// import RadioOption from 'src/components/markdownComponents/RadioOption';
// import Lab from 'src/components/markdownComponents/Lab';
// import Checkpoint from 'src/components/markdownComponents/Checkpoint';
// // Other Components
// import CopyBox from 'src/components/markdownComponents/CopyBox';
// import Typo from 'src/components/markdownComponents/Typo';
// import EditableTag from 'src/components/markdownComponents/EditableTag';

// Some Examples:

// :Typo[test]{blue box}
// "Test" (blue color and boxed)

//:CopyBox[admin123]{label=username}
// Text: "admin123"
// Label: Username:

//:EditableTag[admin]{id=urlParameter1}
// default Text: "admin"
// id: urlParameter1

function reactMarkdownRemarkDirective() {
  const allowedNodeNames = [
    // 'Typo',
    // 'CopyBox',
    // 'EditableTag',
    // 'Quote',
    // 'Terminal',
    // 'Image',
    // 'RedirectCard',
    // 'RedirectButton',
    // 'Checkpoint',
    // 'TextQuestion',
    // 'Lab',
    // 'BlackBox',
    // 'QuestionList',
    // 'RadioQuestion',
    // 'RadioOption',
    "sub",
    "sup",
  ];

  return (tree) => {
    visit(
      tree,
      ["textDirective", "leafDirective", "containerDirective"],
      (node) => {
        if (!allowedNodeNames.includes(node.name)) return;

        node.data = {
          hName: node.name,
          hProperties: node.attributes,
          ...node.data,
        };
        return node;
      }
    );
  };
}

function Link({ node, ...props }) {
  return <a target={"_blank"} {...props} />;
}

const Markdown = forwardRef((props, ref) => {
  const {
    children,
    components,
    titleStyle,
    noSpecialComponents,
    noTypoBorder,
    noEditableTag,
    noCopyBox,
    strongStyle,
    training,
  } = props;
  return (
    <ReactMarkdown
      ref={ref}
      remarkPlugins={
        noSpecialComponents
          ? null
          : [remarkGfm, directive, reactMarkdownRemarkDirective]
      }
      components={{
        h1: ({ node, ...props }) => (
          <h2 style={titleStyle ?? undefined} {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 style={titleStyle ?? undefined} {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h2 style={titleStyle ?? undefined} {...props} />
        ),
        h4: ({ node, ...props }) => (
          <h2 style={titleStyle ?? undefined} {...props} />
        ),
        h5: ({ node, ...props }) => (
          <h2 style={titleStyle ?? undefined} {...props} />
        ),
        h6: ({ node, ...props }) => (
          <h2 style={titleStyle ?? undefined} {...props} />
        ),
        a: Link,
        code: ({ node, ...props }) => {
          const lang = /language-(\w+)/.exec(props.className || "")?.[1] || "";

          return (
            <SyntaxHighlighter
              language={lang}
              style={tomorrowNight}
              showLineNumbers
              customStyle={{
                height: "calc(100vh - 124px) !important",
                maxHeight: "calc(100vh - 124px) !important",
                width: "100%",
                marginTop: "0px",
                overflowY: "auto !important",
                overflowX: "auto !important",
                position: "relative",
              }}
              wrapLines
              lineProps={(lineNumber) => {
                return {
                  id: `code-line-${lineNumber}`,
                  style: {
                    display: "block",
                  },
                };
              }}
            >
              {props.children}
            </SyntaxHighlighter>
          );

          return (
            <code
              style={{
                padding: "0.25rem 0.5rem",
                borderRadius: "0.25rem",
              }}
              {...props}
            />
          );
        },
        strong: (props) => (
          <strong {...props} style={strongStyle ?? undefined} />
        ),

        // // Training Components
        // ...(training && {
        //   h1: ({ node, ...props }) => {
        //     const { children, ...args } = props;

        //     return (
        //       <>
        //         <Typography
        //           variant='h2'
        //           sx={{
        //             mb: '1.25rem',
        //             // borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
        //             lineHeight: '2.625rem',
        //           }}
        //           {...args}
        //         >
        //           {props.children}
        //           <Box
        //             sx={{
        //               height: '0.125rem',
        //               width: '100%',
        //               backgroundColor: (theme) => theme.palette.divider,
        //               borderRadius: '0.125rem',
        //             }}
        //           ></Box>
        //         </Typography>
        //       </>
        //     );
        //   },
        //   h2: ({ node, ...props }) => (
        //     <Typography
        //       variant='h3'
        //       sx={{ mb: '0.75rem' }}
        //       {...props}
        //     />
        //   ),
        //   h3: ({ node, ...props }) => (
        //     <h2
        //       style={titleStyle ?? undefined}
        //       {...props}
        //     />
        //   ),
        //   h4: ({ node, ...props }) => (
        //     <h2
        //       style={titleStyle ?? undefined}
        //       {...props}
        //     />
        //   ),
        //   h5: ({ node, ...props }) => (
        //     <h2
        //       style={titleStyle ?? undefined}
        //       {...props}
        //     />
        //   ),
        //   h6: ({ node, ...props }) => (
        //     <h2
        //       style={titleStyle ?? undefined}
        //       {...props}
        //     />
        //   ),
        //   p: ({ node, ...props }) => (
        //     <Typography
        //       // variant='body1'
        //       sx={{ mb: '1.5rem !important', whiteSpace: 'pre-wrap' }}
        //       {...props}
        //     />
        //   ),
        //   sub: ({ node, ...props }) => <sub {...props} />,
        //   sup: ({ node, ...props }) => <sup {...props} />,
        //   ul: ({ node, ...props }) => {
        //     return (
        //       <ul
        //         style={{ marginBlock: '0', marginBottom: '1.5rem' }}
        //         {...props}
        //       />
        //     );
        //   },
        //   ol: ({ node, ...props }) => {
        //     return (
        //       <ol
        //         style={{ marginBlock: '0', marginBottom: '1.5rem' }}
        //         {...props}
        //       />
        //     );
        //   },
        //   li: ({ node, ...props }) => {
        //     return (
        //       <li
        //         style={{ color: theme.palette.text.primary, fontSize: '1rem' }}
        //         {...props}
        //       />
        //     );
        //   },
        //   hr: ({ node, ...props }) => {
        //     return (
        //       <hr
        //         style={{
        //           marginBlock: '1.5rem',
        //         }}
        //         {...props}
        //       />
        //     );
        //   },
        //   Image: ({ node, ...props }) => {
        //     const { children, ...args } = props;

        //     return (
        //       <img
        //         {...args}
        //         style={{
        //           display: 'block',
        //           margin: args?.center != undefined ? 'auto' : undefined,
        //           // marginBottom: '0.75rem',
        //           borderRadius: '6px',
        //         }}
        //       />
        //     );
        //   },
        //   table: ({ node, ...props }) => {
        //     const theme = useTheme();

        //     const tableStyles = `
        //     table {
        //       border-collapse: collapse;
        //       margin-bottom: 2.5rem;
        //     }
        //     thead {
        //       background-color: ${theme.palette.background.dark};
        //       border-radius: 6px;
        //       font-weight: 500;
        //       font-size: 1rem;
        //     }
        //     thead th:first-child {
        //       border-top-left-radius: 6px;
        //       border-bottom-left-radius: 6px;
        //     }
        //     thead th:last-child {
        //       border-top-right-radius: 6px;
        //       border-bottom-right-radius: 6px;
        //     }
        //     tbody tr {
        //       border-bottom: 1px solid ${theme.palette.text.tertiary};
        //       font-weight: 400;
        //       font-size: 0.875rem;
        //     }
        //     th, td {
        //       padding: 0.75rem 1.25rem;
        //       text-align: left;
        //     }`;

        //     return (
        //       <>
        //         <style>{tableStyles}</style>
        //         <table
        //           {...props}
        //           style={{
        //             tr: {
        //               backgroundColor: theme.palette.background.dark,
        //             },
        //           }}
        //         />
        //       </>
        //     );
        //   },
        //   // Special Components
        //   Quote,
        //   Terminal,
        //   RedirectCard,
        //   RedirectButton,
        //   QuestionList,
        //   TextQuestion,
        //   RadioQuestion,
        //   RadioOption,
        //   Lab,
        //   Checkpoint,
        //   BlackBox,
        // }),
        // If you want to disable the Special Components (Typo, CopyBox, EditableTag, etc.)
        // just set the prop noSpecialComponents to true
        // ...(noSpecialComponents
        //   ? {}
        //   : // If you want to Typo component without the border
        //     // just set the prop noTypoBorder to true
        //     {
        //       Typo: (props) => (
        //         <Typo
        //           {...props}
        //           noTypoBorder={noTypoBorder}
        //         />
        //       ),
        //       // If you want to disable the CopyBox or EditableTag components
        //       // just set the prop noCopyBox or noEditableTag to true
        //       CopyBox: noCopyBox
        //         ? () => null
        //         : (props) => <CopyBox {...props} />,
        //       EditableTag: noEditableTag
        //         ? () => null
        //         : (props) => <EditableTag {...props} />,
        //     }),
        ...components,
      }}
      children={children}
    />
  );
});

export default Markdown;
