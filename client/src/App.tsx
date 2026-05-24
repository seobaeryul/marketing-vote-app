import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Thanks from "./pages/Thanks";
import Stats from "./pages/Stats";
import QRPage from "./pages/QRPage";
import SurveyImage from "./pages/survey/SurveyImage";
import SurveyVote from "./pages/survey/SurveyVote";
import SurveyThanks from "./pages/survey/SurveyThanks";

function Router() {
  return (
    <Switch>
      {/* 메인 앱 라우트 */}
      <Route path="/" component={Home} />
      <Route path="/thanks" component={Thanks} />
      <Route path="/stats" component={Stats} />
      <Route path="/qr" component={QRPage} />

      {/* QR 서브 사이트 라우트 */}
      <Route path="/survey" component={SurveyImage} />
      <Route path="/survey/vote" component={SurveyVote} />
      <Route path="/survey/thanks" component={SurveyThanks} />

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
