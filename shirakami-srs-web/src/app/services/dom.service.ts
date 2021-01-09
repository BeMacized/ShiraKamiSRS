import {
    ApplicationRef,
    ComponentFactoryResolver,
    ComponentRef,
    EmbeddedViewRef,
    Injectable,
    Injector,
} from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class DomService {
    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private appRef: ApplicationRef,
        private injector: Injector
    ) {}

    public appendComponentTo<C>(
        parentId: string,
        child: new (...a: any[]) => C,
        fields: { [field: string]: any } = {}
    ): DomComponent<C> {
        // Create a component reference from the component
        const componentRef = this.componentFactoryResolver
            .resolveComponentFactory(child)
            .create(this.injector);
        // Create dom component wrapper for component
        const domComponent = new DomComponent<C>(componentRef, this.appRef);
        // Attach fields to the component
        fields = Object.assign({}, fields, { __DOM_COMPONENT: domComponent });
        for (const key of Object.keys(fields))
            componentRef.instance[key] = fields[key];
        // Attach component to the appRef so that it's inside the ng component tree
        this.appRef.attachView(componentRef.hostView);
        // Get DOM element from component
        const childDomElem = (componentRef.hostView as EmbeddedViewRef<any>)
            .rootNodes[0] as HTMLElement;
        // Append DOM element to the body
        document.getElementById(parentId).appendChild(childDomElem);
        // Return as DomComponent
        return domComponent;
    }
}

export class DomComponent<C = {}> {
    private onRemove: () => void;

    constructor(
        private componentRef: ComponentRef<C>,
        private appRef: ApplicationRef
    ) {}

    get component(): C {
        return this.componentRef.instance;
    }

    remove() {
        if (this.componentRef) {
            this.appRef.detachView(this.componentRef.hostView);
            this.componentRef.destroy();
            this.componentRef = null;
            if (this.onRemove) this.onRemove();
            this.onRemove = null;
        }
    }

    on(event: 'remove', cb: () => void) {
        this.onRemove = cb;
    }
}
